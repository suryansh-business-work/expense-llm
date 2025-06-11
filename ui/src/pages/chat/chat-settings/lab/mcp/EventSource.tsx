import React, { useRef, useState, useEffect } from "react";
import {
  TextField, Button, Drawer, Box, Typography, IconButton, Paper,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  CircularProgress
} from "@mui/material";
import TerminalIcon from "@mui/icons-material/Terminal";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

type ConnState = "idle" | "connecting" | "connected" | "failed";

interface EventSourceProps {
  onConnected: (tools: any[], mcpClient: any) => void;
}

interface McpServer {
  mcpServerId: string;
  mcpServerName: string;
}

const EventSource: React.FC<EventSourceProps> = ({ onConnected }) => {
  const [eventUrl, setEventUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connState, setConnState] = useState<ConnState>("idle");
  const [serverType, setServerType] = useState("custom");
  const [serverList, setServerList] = useState<McpServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchMcpServers();
  }, []);

  // Update eventUrl when serverType or selectedServerId changes
  useEffect(() => {
    if (serverType === "custom") {
      // Keep the current URL if it's custom
      if (!eventUrl) {
        setEventUrl("http://localhost:3001/your-server-id/mcp/sse");
      }
    } else if (serverType === "mcp" && selectedServerId) {
      setEventUrl(`http://localhost:3001/${selectedServerId}/mcp/sse`);
    }
  }, [serverType, selectedServerId]);

  // Fetch MCP servers from API
  const fetchMcpServers = async () => {
    const token = getAuthToken();
    if (!token) {
      addLog("❌ Cannot fetch server list: No authentication token found.");
      return;
    }

    setIsLoadingServers(true);
    try {
      const response = await fetch('http://localhost:3000/v1/api/mcp-server/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch servers: ${response.status}`);
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setServerList(result.data);
        
        // If we have servers and none selected yet, select the first one
        if (result.data.length > 0 && !selectedServerId) {
          setSelectedServerId(result.data[0].mcpServerId);
          setServerType("mcp"); // Auto-select MCP option if servers exist
        }
      }
      addLog(`✅ Loaded ${result.data?.length || 0} MCP servers.`);
    } catch (error) {
      addLog(`❌ Failed to fetch MCP servers: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingServers(false);
    }
  };

  // Add a log entry
  const addLog = (msg: string) => {
    setLogs(logs => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] ${msg}`
    ]);
  };

  // Get authentication token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
  };

  // Handle server type change (MCP vs Custom)
  const handleServerTypeChange = (event: SelectChangeEvent) => {
    setServerType(event.target.value);
    
    // Reset connection if we change server type
    if (connState === "connected") {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnState("idle");
      onConnected([], null);
    }
  };

  // Handle MCP server selection change
  const handleServerChange = (event: SelectChangeEvent) => {
    setSelectedServerId(event.target.value);
    
    // Reset connection if we change server
    if (connState === "connected") {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnState("idle");
      onConnected([], null);
    }
  };

  // Connect and log all steps
  const handleConnectWithLogs = async () => {
    if (connState === "connected") {
      // Disconnect logic
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnState("idle");
      addLog("🔴 Disconnected from EventSource.");
      onConnected([], null); // Clear tools on disconnect
      return;
    }
    
    if (connState === "failed") {
      // On retry, clear tools as well
      onConnected([], null);
    }
    
    setConnState("connecting");
    addLog("Start checking EventSource...");
    
    // Get token from localStorage
    const token = getAuthToken();
    if (!token) {
      addLog("❌ Authentication token not found in localStorage.");
      setConnState("failed");
      return;
    }
    
    addLog("🔑 Authentication token retrieved from localStorage.");

    // Create URL with token
    const url = new URL(eventUrl);
    url.searchParams.append('token', token);
    
    setLogs(logs => [...logs, `[${new Date().toLocaleTimeString()}] Connecting to ${url.toString()}...`]);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const es = new window.EventSource(url.toString());
    eventSourceRef.current = es;

    es.onopen = async () => {
      addLog("✅ Connected to EventSource.");
      setConnState("connected");
      // Fetch tools using MCP SDK
      try {
        const mcpClient = new Client({ name: "ui-client", version: "1.0.0" });
        
        // Create SSEClientTransport with authentication
        const transport = new SSEClientTransport(url);
        
        // Connect to the MCP server
        await mcpClient.connect(transport);
        
        const toolList = (await mcpClient.listTools()).tools;
        addLog(`🛠️ Loaded ${toolList.length} tools.`);
        onConnected(toolList, mcpClient); // Send tools to parent
      } catch (err: any) {
        addLog(`❌ Failed to load tools: ${err.message}`);
        onConnected([], null); // Send empty list on error
      }
    };
    
    es.onmessage = (event) => {
      console.log("EventSource message:", event.data);
      addLog(`Event: ${event.data}`);
    };
    
    es.onerror = () => {
      addLog("❌ Error or connection closed.");
      setConnState("failed");
      onConnected([], null); // Clear tools on error/retry
      es.close();
    };
  };

  const handleShowLogs = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  // Clean up EventSource on unmount
  React.useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Button label and color logic
  let buttonLabel = "Connect";
  let buttonColor: "primary" | "success" | "error" = "primary";
  let buttonStyle: any = {};
  let buttonDisabled = false;

  if (connState === "connected") {
    buttonLabel = "Disconnect";
    buttonColor = "error";
    buttonStyle = { background: "#d32f2f", color: "#fff" };
  } else if (connState === "connecting") {
    buttonLabel = "Connecting...";
    buttonColor = "primary";
    buttonDisabled = true;
  } else if (connState === "failed") {
    buttonLabel = "Retry";
    buttonColor = "error";
  }

  return (
    <>
      <Paper sx={{ p: 2, mb: 2, background: "#eee", boxShadow: 'none' }}>
        <Typography variant="h6" className="mb-3" textTransform={"capitalize"}>
          Event Source (MCP Server)
        </Typography>
        
        {/* Server Type Selection - Using Bootstrap Grid */}
        <div className="row mb-3">
          <div className="col-12 col-md-4 mb-2 mb-md-0 mb-4">
            <FormControl fullWidth size="small" sx={{ minWidth: '100%' }}>
              <InputLabel id="server-type-label">Server Type</InputLabel>
              <Select
                labelId="server-type-label"
                value={serverType}
                label="Server Type"
                onChange={handleServerTypeChange}
                disabled={connState === "connected" || connState === "connecting"}
              >
                <MenuItem value="mcp">Your MCP Servers</MenuItem>
                <MenuItem value="custom">Custom URL</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          {serverType === "mcp" ? (
            <div className="col-11 col-md-7 d-flex align-items-center">
              <FormControl fullWidth size="small" sx={{ flex: 1, minWidth: '100%' }}>
                <InputLabel id="server-select-label">MCP Server</InputLabel>
                <Select
                  labelId="server-select-label"
                  value={selectedServerId}
                  label="MCP Server"
                  onChange={handleServerChange}
                  disabled={connState === "connected" || connState === "connecting" || isLoadingServers}
                >
                  {serverList.map((server) => (
                    <MenuItem key={server.mcpServerId} value={server.mcpServerId}>
                      {server.mcpServerName}
                    </MenuItem>
                  ))}
                  {serverList.length === 0 && (
                    <MenuItem disabled value="">
                      {isLoadingServers ? "Loading servers..." : "No servers found"}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <IconButton 
                size="small" 
                onClick={fetchMcpServers} 
                disabled={isLoadingServers}
                sx={{ ml: 1 }}
                title="Refresh server list"
              >
                {isLoadingServers ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </div>
          ) : (
            <div className="col-12 col-md-8">
              <TextField
                label="Event Source URL"
                variant="outlined"
                size="small"
                value={eventUrl}
                onChange={e => setEventUrl(e.target.value)}
                fullWidth
                disabled={connState === "connected" || connState === "connecting"}
                placeholder="http://localhost:3001/server-id/mcp/sse"
              />
            </div>
          )}
        </div>
        
        {/* Final URL Display */}
        {serverType === "mcp" && selectedServerId && (
          <Box sx={{ mb: 3, p: 1.5, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.05)' }}>
            <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
              URL: {eventUrl}
            </Typography>
          </Box>
        )}
        
        {/* Connect Button and Logs - Using Bootstrap Grid */}
        <div className="row align-items-center">
          <div className="col-6 col-md-2 mb-2 mb-md-0 d-grid">
            <Button
              variant="contained"
              color={buttonColor}
              onClick={handleConnectWithLogs}
              startIcon={<TerminalIcon />}
              disabled={buttonDisabled || !eventUrl}
              sx={buttonStyle}
              fullWidth
            >
              {buttonLabel}
            </Button>
          </div>
          <div className="col-6 col-md-3 d-flex justify-content-md-start mt-2 mt-md-0">
            <Button
              variant="text"
              onClick={handleShowLogs}
              disabled={logs.length === 0}
              style={{ minWidth: 100 }}
            >
              Show Logs
            </Button>
          </div>
          <div className="col-12 col-md-7">
            <Typography variant="body2" color="text.secondary">
              {connState === "connected"
                ? "Connected. Registered tools will load."
                : connState === "failed"
                  ? "Connection failed. Please retry."
                  : "Not connected. Select a server or enter URL and click Connect."}
            </Typography>
          </div>
        </div>
      </Paper>
      
      {/* Drawer remains unchanged */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: "100vw", sm: 500 }, background: "#181818", color: "#b9f" }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2} sx={{ borderBottom: "1px solid #333" }}>
          <Typography variant="h6" sx={{ color: "#fff" }}>
            Event Logs
          </Typography>
          <IconButton onClick={handleCloseDrawer} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box p={2} sx={{ fontFamily: "monospace", fontSize: 15, height: "100%", overflowY: "auto" }}>
          {logs.length === 0 ? (
            <span style={{ color: "#888" }}>No logs yet.</span>
          ) : (
            logs.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))
          )
          }
        </Box>
      </Drawer>
    </>
  );
};

export default EventSource;
