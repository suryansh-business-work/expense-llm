import React, { useRef, useState } from "react";
import {
  TextField, Button, Drawer, Box, Typography, IconButton, Paper
} from "@mui/material";
import TerminalIcon from "@mui/icons-material/Terminal";
import CloseIcon from "@mui/icons-material/Close";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

type ConnState = "idle" | "connecting" | "connected" | "failed";

interface EventSourceProps {
  onConnected: (tools: any[], mcpClient: any) => void;
}

const EventSource: React.FC<EventSourceProps> = ({ onConnected }) => {
  const [eventUrl, setEventUrl] = useState("http://localhost:3001/50d4f219-3dc0-450c-8fed-47f09e854e91/mcp/sse");
  const [logs, setLogs] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connState, setConnState] = useState<ConnState>("idle");
  const eventSourceRef = useRef<EventSource | null>(null);

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
        <div className="row align-items-center mb-2">
          <div className="col-12 col-md-8 mb-2 mb-md-0">
            <TextField
              label="Event Source URL"
              variant="outlined"
              size="small"
              value={eventUrl}
              onChange={e => setEventUrl(e.target.value)}
              fullWidth
              disabled={connState === "connected"}
            />
          </div>
          <div className="col-6 col-md-2 mb-2 mb-md-0 d-grid">
            <Button
              variant="contained"
              color={buttonColor}
              onClick={handleConnectWithLogs}
              startIcon={<TerminalIcon />}
              disabled={buttonDisabled}
              sx={buttonStyle}
              fullWidth
            >
              {buttonLabel}
            </Button>
          </div>
          <div className="col-6 col-md-2 d-flex justify-content-md-end justify-content-end justify-content-md-center mt-2 mt-md-0">
            <Button
              variant="text"
              onClick={handleShowLogs}
              disabled={logs.length === 0}
              style={{ minWidth: 100 }}
            >
              Show Logs
            </Button>
          </div>
        </div>
        <Typography variant="body2" color="text.secondary">
          {connState === "connected"
            ? "Connected. Registered tools will load."
            : connState === "failed"
              ? "Connection failed. Please retry."
              : "Not connected. Enter the Event Source URL and click Connect."}
        </Typography>
      </Paper>
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
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default EventSource;
