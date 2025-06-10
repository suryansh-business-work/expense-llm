import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Button, CircularProgress, Alert } from '@mui/material';
import { Terminal as TerminalIcon } from '@mui/icons-material';
import { ReactTerminal } from 'react-terminal';
import axios from 'axios';

interface ContainerInfo {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
}

const DockerTerminal: React.FC = () => {
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to Docker Terminal', 'Select a container and click "Connect" to start a session']);
  const [terminalPrompt, setTerminalPrompt] = useState<string>("$ ");
  
  const socketRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<any>(null);
  
  // Fetch container list on component mount
  useEffect(() => {
    fetchContainers();
    
    return () => {
      disconnectTerminal();
    };
  }, []);
  
  const fetchContainers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/v1/api/code-run/docker/containers');
      
      let containerList: ContainerInfo[] = [];
      if (Array.isArray(response.data)) {
        containerList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        containerList = response.data.data;
      } else if (response.data && response.data.containers && Array.isArray(response.data.containers)) {
        containerList = response.data.containers;
      }

      // Filter to only running containers
      const runningContainers = containerList.filter(c => c.State === 'running');
      setContainers(runningContainers);
      
      if (runningContainers.length > 0) {
        setSelectedContainer(runningContainers[0].Id);
      }
    } catch (error) {
      setError('Failed to fetch containers');
      console.error('Error fetching containers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const connectToTerminal = async () => {
    if (!selectedContainer) return;
    
    // Disconnect any existing connection
    disconnectTerminal();
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear terminal output
      setTerminalOutput(['Connecting to container...']);
      
      // Find selected container name for terminal prompt
      const container = containers.find(c => c.Id === selectedContainer);
      const containerName = container ? container.Names[0].replace('/', '') : 'container';
      
      // Request a terminal session from your backend
      const response = await axios.post(`http://localhost:3000/v1/api/code-run/docker/container/${selectedContainer}/exec`, {
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ["/bin/sh", "-c", "if [ -f /bin/bash ]; then /bin/bash; elif [ -f /bin/sh ]; then /bin/sh; else exec sh; fi"]
      });
      
      const execId = response.data.Id;
      
      // Start the WebSocket connection
      const wsUrl = `ws://localhost:3000/v1/api/code-run/docker/exec/${execId}/ws`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setConnected(true);
        setLoading(false);
        setTerminalOutput(['Connected to container terminal', '------------------------------', '']);
        setTerminalPrompt(`${containerName}:~$ `);
      };
      
      socket.onmessage = (event) => {
        // Add output to terminal
        const output = event.data.toString();
        setTerminalOutput(prev => {
          // If output has line breaks, split it
          if (output.includes('\n')) {
            const lines = output.split('\n');
            return [...prev, ...lines];
          }
          // Append to the last line if it doesn't end with newline
          const updatedPrev = [...prev];
          const lastIdx = updatedPrev.length - 1;
          updatedPrev[lastIdx] = updatedPrev[lastIdx] + output;
          return updatedPrev;
        });
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Terminal connection error');
        setConnected(false);
        setLoading(false);
        setTerminalOutput(prev => [...prev, 'Error: Connection failed']);
      };
      
      socket.onclose = () => {
        setTerminalOutput(prev => [...prev, '', 'Connection closed']);
        setConnected(false);
      };
      
    } catch (error) {
      console.error('Error connecting to terminal:', error);
      setError('Failed to connect to container terminal');
      setLoading(false);
      setTerminalOutput(prev => [...prev, 'Error: Failed to connect']);
    }
  };
  
  const disconnectTerminal = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    socketRef.current = null;
    setConnected(false);
  };
  
  // Handle terminal input
  const handleTerminalInput = (input: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(input + '\n');
      return '';
    }
    return 'Terminal not connected. Click "Connect" to start a session.';
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Docker Container Terminal
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="container-select-label">Select Container</InputLabel>
          <Select
            labelId="container-select-label"
            value={selectedContainer}
            label="Select Container"
            onChange={(e) => setSelectedContainer(e.target.value as string)}
            disabled={loading || connected}
          >
            {containers.map((container) => (
              <MenuItem key={container.Id} value={container.Id}>
                {container.Names[0].replace('/', '')} ({container.Image})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {!connected ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TerminalIcon />}
            onClick={connectToTerminal}
            disabled={loading || !selectedContainer || containers.length === 0}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="secondary"
            onClick={disconnectTerminal}
          >
            Disconnect
          </Button>
        )}
        
        <Button
          variant="outlined"
          onClick={fetchContainers}
          disabled={loading}
        >
          Refresh Containers
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {containers.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No running containers available. Start a container to connect to its terminal.
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          height: '70vh',
          bgcolor: '#1e1e1e',
          borderRadius: 1,
          overflow: 'hidden',
          '& .react-terminal-wrapper': {
            height: '100%',
            background: '#1e1e1e !important',
            border: 'none !important'
          },
          '& .react-terminal': {
            height: '100%',
            padding: '12px',
            fontSize: '14px',
            fontFamily: 'Consolas, "Courier New", monospace',
            color: '#eeeeee !important',
            background: '#1e1e1e !important'
          },
          '& .react-terminal-input': {
            background: '#1e1e1e !important',
            color: '#eeeeee !important'
          }
        }}
      >
        <ReactTerminal
          ref={terminalRef}
          welcomeMessage={null}
          prompt={terminalPrompt}
          commands={{
            command: handleTerminalInput
          }}
          showControlBar={false}
          errorMessage="Command not recognized"
        />
        
        {!connected && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              zIndex: 10
            }}
          >
            <TerminalIcon sx={{ fontSize: 60, color: '#555' }} />
            <Typography color="#aaa" sx={{ mt: 2 }}>
              {containers.length === 0 
                ? 'No running containers available' 
                : 'Terminal disconnected. Click Connect to start a session.'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DockerTerminal;