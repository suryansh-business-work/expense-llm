import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Snackbar,
  Alert,
  Button
} from "@mui/material";
import Editor from "@monaco-editor/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

const API_BASE = "http://localhost:3000/v1/api/mcp-server/tool-code";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CodeSection: React.FC = () => {
  // Get parameters from URL
  const { mcpServerId, toolId } = useParams<{ mcpServerId: string; toolId: string }>();
  
  // Local state management
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  
  // Fetch code from API when component mounts
  useEffect(() => {
    if (!toolId) return;
    
    setLoading(true);
    axios.get(`${API_BASE}/get/${toolId}`, {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (res.data?.data?.toolCode) {
          setCode(res.data.data.toolCode);
        }
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "Failed to fetch tool code",
          severity: "error"
        });
      })
      .finally(() => setLoading(false));
  }, [toolId]);
  
  // Add keyboard shortcut for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S or Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        handleSave();
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, toolId, mcpServerId]); // Dependencies needed for handleSave
  
  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };
  
  // Handle save
  const handleSave = async () => {
    if (!toolId || !mcpServerId || loading) return;
    
    setLoading(true);
    try {
      // Save code
      await axios.post(`${API_BASE}/save`, {
        toolId,
        toolCode: code
      }, {
        headers: getAuthHeaders()
      });
      
      setSnackbar({
        open: true,
        message: "Code saved successfully",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save code",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        pb: 3,
        mb: 4
      }}
    >
      {/* Header with actions */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <i className="fa-brands fa-node-js me-2"></i>
          <Typography variant="subtitle1">Node.js</Typography>
        </Box>
        <Box>
          <Tooltip title="Copy code">
            <IconButton onClick={() => navigator.clipboard.writeText(code)}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ ml: 1 }}
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </Button>
        </Box>
      </Box>
      
      {/* Monaco Editor */}
      <Box sx={{ height: 500, border: '1px solid #eee', position: 'relative' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
          }}
          loading={
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1e1e1e'
            }}>
              <CircularProgress color="info" size={40} />
            </Box>
          }
        />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CodeSection;
