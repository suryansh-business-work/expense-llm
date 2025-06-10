import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Tooltip
} from "@mui/material";
import TerminalIcon from "@mui/icons-material/Terminal";
import CloseIcon from "@mui/icons-material/Close";

interface PackageInfo {
  name: string;
  description?: string;
  version?: string;
}

const TerminalSection: React.FC = () => {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Terminal ready. You can install npm packages here.",
    "Type 'help' for available commands."
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setPackageSearchResults] = useState<PackageInfo[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Scroll terminal to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Handle terminal commands
  const handleTerminalCommand = async (command: string) => {
    // Add the command to the terminal output
    setTerminalOutput(prev => [...prev, `> ${command}`]);
    setTerminalInput("");
    setIsProcessing(true);

    // Parse the command
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();

    try {
      if (cmd === 'clear') {
        // Clear terminal
        setTerminalOutput([]);
      } else if (cmd === 'help') {
        // Show help
        setTerminalOutput(prev => [
          ...prev,
          "Available commands:",
          "  install [package] - Install a package",
          "  search [query] - Search for packages",
          "  list - List installed packages",
          "  clear - Clear terminal",
          "  help - Show this help"
        ]);
      } else if (cmd === 'install') {
        if (args.length < 2) {
          setTerminalOutput(prev => [...prev, "❌ Error: Please specify a package to install"]);
          return;
        }

        const packageName = args[1];

        setTerminalOutput(prev => [...prev, `Installing ${packageName} from npm...`]);

        // Mock installation - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

        setTerminalOutput(prev => [
          ...prev,
          `✅ Successfully installed ${packageName}`,
          `Added ${packageName} to package.json dependencies`
        ]);
      } else if (cmd === 'search') {
        if (args.length < 2) {
          setTerminalOutput(prev => [...prev, "❌ Error: Please specify a search query"]);
          return;
        }

        const query = args.slice(1).join(' ');

        setTerminalOutput(prev => [...prev, `Searching for ${query} in npm...`]);

        // Mock search results - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

        // Generate some fake results based on the query
        const mockResults = [
          { name: `${query}-core`, description: `Core library for ${query}`, version: "1.0.0" },
          { name: `${query}-utils`, description: `Utilities for ${query}`, version: "0.8.5" },
          { name: `@types/${query}`, description: `Type definitions for ${query}`, version: "2.1.3" }
        ] as PackageInfo[];

        setPackageSearchResults(mockResults);
        setTerminalOutput(prev => [
          ...prev,
          `Found ${mockResults.length} packages matching "${query}":`,
          ...mockResults.map((pkg, i) => `  ${i + 1}. ${pkg.name}@${pkg.version} - ${pkg.description}`)
        ]);
      } else if (cmd === 'list') {
        // Mock list of installed packages
        const mockInstalled = [
          { name: 'axios', version: '1.3.4' },
          { name: 'lodash', version: '4.17.21' }
        ];

        if (mockInstalled.length === 0) {
          setTerminalOutput(prev => [...prev, `No npm packages installed yet.`]);
        } else {
          setTerminalOutput(prev => [
            ...prev,
            `Installed npm packages:`,
            ...mockInstalled.map(pkg => `  ${pkg.name}@${pkg.version}`)
          ]);
        }
      } else {
        setTerminalOutput(prev => [...prev, `❌ Unknown command: ${cmd}. Type 'help' for available commands.`]);
      }
    } catch (error: any) {
      setTerminalOutput(prev => [...prev, `❌ Error: ${error.message || 'Unknown error'}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box mt={3}>
      <Button
        variant={terminalOpen ? "outlined" : "contained"}
        color={terminalOpen ? "inherit" : "primary"}
        startIcon={<TerminalIcon />}
        onClick={() => setTerminalOpen(!terminalOpen)}
        sx={{ mb: terminalOpen ? 2 : 0, borderRadius: 2 }}
      >
        {terminalOpen ? "Hide Terminal" : "Open Terminal"}
      </Button>

      {terminalOpen && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 2,
            bgcolor: '#282c34'
          }}
        >
          {/* Terminal header */}
          <Box
            sx={{
              p: 1,
              bgcolor: '#21252b',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" sx={{ color: '#abb2bf', fontFamily: 'monospace' }}>
              npm terminal
            </Typography>
            <Box>
              <Tooltip title="Clear Terminal">
                <IconButton
                  size="small"
                  sx={{ color: '#abb2bf' }}
                  onClick={() => setTerminalOutput([])}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Terminal output */}
          <Box
            ref={terminalRef}
            sx={{
              p: 2,
              height: '300px',
              overflowY: 'auto',
              color: '#abb2bf',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {terminalOutput.map((line, i) => (
              <Box
                key={i}
                sx={{
                  mb: 0.5,
                  color: line.startsWith('❌') ? '#e06c75' :
                    line.startsWith('✅') ? '#98c379' :
                      line.startsWith('>') ? '#e5c07b' : '#abb2bf'
                }}
              >
                {line}
              </Box>
            ))}
            {isProcessing && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={14} sx={{ mr: 1, color: '#abb2bf' }} />
                <Typography variant="body2" sx={{ color: '#abb2bf' }}>
                  Processing...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Terminal input */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography
              sx={{
                color: '#61afef',
                fontFamily: 'monospace',
                mr: 1.5,
                fontSize: '0.875rem'
              }}
            >
              &gt;
            </Typography>
            <TextField
              fullWidth
              variant="standard"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleTerminalCommand(terminalInput);
                }
              }}
              placeholder={isProcessing ? 'Processing...' : 'Type commands (e.g., install axios)'}
              disabled={isProcessing}
              InputProps={{
                disableUnderline: true,
                sx: {
                  color: '#abb2bf',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  '&::placeholder': {
                    color: 'rgba(171, 178, 191, 0.5)'
                  }
                }
              }}
              autoFocus
            />
          </Box>

          {/* Package quick install */}
          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="caption" sx={{ color: '#abb2bf', display: 'block', mb: 1 }}>
              Quick install common packages:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: '#abb2bf',
                  borderColor: 'rgba(171, 178, 191, 0.3)',
                  '&:hover': { borderColor: '#abb2bf' }
                }}
                onClick={() => handleTerminalCommand('install axios')}
              >
                axios
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: '#abb2bf',
                  borderColor: 'rgba(171, 178, 191, 0.3)',
                  '&:hover': { borderColor: '#abb2bf' }
                }}
                onClick={() => handleTerminalCommand('install lodash')}
              >
                lodash
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: '#abb2bf',
                  borderColor: 'rgba(171, 178, 191, 0.3)',
                  '&:hover': { borderColor: '#abb2bf' }
                }}
                onClick={() => handleTerminalCommand('install mongoose')}
              >
                mongoose
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: '#abb2bf',
                  borderColor: 'rgba(171, 178, 191, 0.3)',
                  '&:hover': { borderColor: '#abb2bf' }
                }}
                onClick={() => handleTerminalCommand('install express')}
              >
                express
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TerminalSection;
