import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { terminalSocket } from '../../services/socket';
import { Box, Button, Paper, Typography, Stack, CircularProgress, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { motion } from 'framer-motion';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  containerId: string;
}

const XTerminal: React.FC<XTerminalProps> = ({ containerId }) => {
  const theme = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [isShellMode, setIsShellMode] = useState<boolean>(false);
  const [isTerminalReady, setIsTerminalReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  // Initialize terminal with a delay to ensure DOM is ready
  useEffect(() => {
    let term: Terminal | null = null;
    let fit: FitAddon | null = null;

    const initializeTerminal = () => {
      if (!terminalRef.current) return;

      // Create new terminal with theme matching UI theme
      term = new Terminal({
        fontFamily: '"Cascadia Code", "Fira Code", Menlo, monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        cursorStyle: 'block',
        theme: {
          background: theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa',
          foreground: theme.palette.mode === 'dark' ? '#c9d1d9' : '#24292f',
          black: theme.palette.mode === 'dark' ? '#484f58' : '#24292f',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#76e3ea',
          white: theme.palette.mode === 'dark' ? '#c9d1d9' : '#6e7781',
          brightBlack: theme.palette.mode === 'dark' ? '#6e7681' : '#57606a',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#b3f0ff',
          brightWhite: theme.palette.mode === 'dark' ? '#f0f6fc' : '#24292f',
        }
      });

      // Create fit addon
      fit = new FitAddon();
      term.loadAddon(fit);

      try {
        // Open terminal in container
        term.open(terminalRef.current);

        // Delay fitting to ensure DOM is ready
        setTimeout(() => {
          try {
            if (terminalRef.current?.offsetHeight && terminalRef.current?.offsetWidth) {
              fit?.fit();
              setIsTerminalReady(true);
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Error fitting terminal after delay:', err);
            setIsLoading(false);
          }
        }, 300);

        setTerminal(term);
        setFitAddon(fit);

        // Write welcome message
        term.writeln('\r\n\x1B[1;34m=== Docker Container Terminal ===\x1B[0m');
        term.writeln('\r\n\x1B[32mReady to connect to container.\x1B[0m');
      } catch (err) {
        console.error('Error initializing terminal:', err);
        setIsLoading(false);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initializeTerminal, 100);

    return () => {
      clearTimeout(timer);
      if (term) {
        try {
          term.dispose();
        } catch (err) {
          console.error('Error disposing terminal:', err);
        }
      }
    };
  }, [theme.palette.mode]);

  // Handle container selection
  useEffect(() => {
    if (containerId && terminal && isTerminalReady) {
      try {
        terminal.clear();
        terminal.writeln(`\r\n\x1B[1;34m=== Connecting to container: ${containerId} ===\x1B[0m`);

        terminalSocket.selectContainer(containerId);
      } catch (error) {
        console.error('Error connecting to container:', error);
        terminal.writeln(`\r\n\x1B[31mError: ${error instanceof Error ? error.message : String(error)}\x1B[0m`);
      }
    }
  }, [containerId, terminal, isTerminalReady]);

  // Set up socket event listeners
  useEffect(() => {
    if (!terminal || !isTerminalReady) return;

    const outputHandler = (data: string) => {
      try {
        terminal.write(data);
      } catch (err) {
        console.error('Error writing to terminal:', err);
      }
    };

    const errorHandler = (data: { message: string }) => {
      try {
        terminal.writeln(`\r\n\x1B[31mError: ${data.message}\x1B[0m`);
      } catch (err) {
        console.error('Error writing error to terminal:', err);
      }
    };

    const finishedHandler = (data: { exitCode: number }) => {
      try {
        const color = data.exitCode === 0 ? '\x1B[32m' : '\x1B[31m';
        terminal.writeln(`\r\n${color}Command completed with exit code ${data.exitCode}\x1B[0m`);
      } catch (err) {
        console.error('Error writing completion to terminal:', err);
      }
    };

    const containerSelectedHandler = (data: { success: boolean, containerId: string }) => {
      try {
        if (data.success) {
          terminal.writeln(`\r\n\x1B[32mConnected to container ${data.containerId}\x1B[0m\r\n`);
        }
      } catch (err) {
        console.error('Error writing container selection to terminal:', err);
      }
    };

    const shellStartedHandler = () => {
      try {
        setIsShellMode(true);
        terminal.writeln('\r\n\x1B[34mInteractive shell started. Type commands and press Enter.\x1B[0m\r\n');

        // Focus the terminal when shell starts
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.focus();
          }
        }, 100);
      } catch (err) {
        console.error('Error handling shell start:', err);
      }
    };

    const shellClosedHandler = () => {
      try {
        setIsShellMode(false);
        terminal.writeln('\r\n\x1B[33mInteractive shell closed.\x1B[0m\r\n');
      } catch (err) {
        console.error('Error handling shell close:', err);
      }
    };

    // Register event handlers
    const unsubscribeOutput = terminalSocket.on('output', outputHandler);
    const unsubscribeError = terminalSocket.on('error', errorHandler);
    const unsubscribeFinished = terminalSocket.on('finished', finishedHandler);
    const unsubscribeContainerSelected = terminalSocket.on('container-selected', containerSelectedHandler);
    const unsubscribeShellStarted = terminalSocket.on('shell-started', shellStartedHandler);
    const unsubscribeShellClosed = terminalSocket.on('shell-closed', shellClosedHandler);

    // Set up terminal input handling - THIS IS THE CRITICAL PART FOR TYPING
    const inputHandler = terminal.onData((data) => {
      try {
        if (isShellMode) {
          // In shell mode, send all keystrokes to the server
          terminalSocket.sendInput(data);
        } else {
          // In non-shell mode, echo the keystroke locally and handle Enter
          terminal.write(data);

          if (data === '\r') { // Enter key
            // Get the current line and send as command
            try {
              const currentLine = terminal.buffer.active.getLine(terminal.buffer.active.cursorY)?.translateToString().trim();
              if (currentLine && currentLine.length > 0) {
                terminalSocket.executeCommand(currentLine);
              }
            } catch (err) {
              console.error('Error processing command:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error handling terminal input:', err);
      }
    });

    // Add manual focus to handle click events
    const focusHandler = () => {
      if (terminalRef.current) {
        terminalRef.current.focus();
      }
    };

    if (terminalRef.current) {
      terminalRef.current.addEventListener('click', focusHandler);
    }

    // Clean up event handlers
    return () => {
      try {
        unsubscribeOutput();
        unsubscribeError();
        unsubscribeFinished();
        unsubscribeContainerSelected();
        unsubscribeShellStarted();
        unsubscribeShellClosed();
        inputHandler.dispose();

        if (terminalRef.current) {
          terminalRef.current.removeEventListener('click', focusHandler);
        }
      } catch (err) {
        console.error('Error cleaning up terminal handlers:', err);
      }
    };
  }, [terminal, isShellMode, isTerminalReady]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Paper
        elevation={3}
        sx={{
          height: 500,
          width: '100%',
          bgcolor: theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 10
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ ml: 2, color: 'white' }}>
              Initializing terminal...
            </Typography>
          </motion.div>
        )}
        <Box
          ref={terminalRef}
          sx={{
            height: '100%',
            width: '100%',
            padding: 1,
            '& .xterm': {
              height: '100%'
            },
            '& .xterm-viewport': {
              overflow: 'auto'
            }
          }}
        />
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={() => terminalSocket.startShell()}
          disabled={!containerId || !isTerminalReady}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            background: theme.palette.primary.main,
            '&:hover': {
              background: theme.palette.primary.dark
            }
          }}
        >
          Start Shell
        </Button>

        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={() => terminal?.clear()}
          disabled={!isTerminalReady}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2
          }}
        >
          Clear
        </Button>
      </Stack>
    </Box>
  );
};

export default XTerminal;
