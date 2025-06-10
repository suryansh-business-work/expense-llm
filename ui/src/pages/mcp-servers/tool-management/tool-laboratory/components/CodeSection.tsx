import React, { useEffect, useState } from 'react';
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
import { useToolContext } from '../context/ToolContext';
import axios from "axios";
import { useParams } from 'react-router-dom';

const API_BASE = "http://localhost:3000/v1/api/mcp-server/tool-code";

// Helper to get auth headers with token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CodeSection: React.FC = () => {
  const {
    code,
    setCode,
    handleCodeChange,
    selectedToolId,
    setSelectedToolId
  } = useToolContext();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const { toolId } = useParams();
  
  // Fetch tool code for selected toolId using /get/:toolId
  useEffect(() => {
    if (!toolId) return;
    setLoading(true);
    axios.get(`${API_BASE}/get/${toolId}`, {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (res.data?.data?.toolCode) {
          setCode((prev: any) => ({
            ...prev,
            nodejs: res.data.data.toolCode
          }));
        }
      })
      .catch(() => setSnackbar({ open: true, message: "Failed to fetch tool code.", severity: "error" }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [selectedToolId]);

  // Save or update code
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/save`, {
          toolId: toolId,
          toolCode: code.nodejs
        }, {
          headers: getAuthHeaders()
        });
        setSelectedToolId(res.data.data.toolId);
        setSnackbar({ open: true, message: "Tool code created.", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to save tool code.", severity: "error" });
    }
    setLoading(false);
  };

  // List all tool codes for user
  const handleList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/list`, {
        headers: getAuthHeaders()
      });
      setSnackbar({ open: true, message: `Fetched ${res.data.data.length} tool codes.`, severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to fetch tool codes.", severity: "error" });
    }
    setLoading(false);
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
            <IconButton onClick={() => navigator.clipboard.writeText(code.nodejs)}>
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
          <Button
            variant="text"
            color="secondary"
            size="small"
            sx={{ ml: 1 }}
            onClick={handleList}
            disabled={loading}
          >
            List All
          </Button>
        </Box>
      </Box>
      
      {/* Monaco Editor */}
      <Box sx={{ height: 500, border: '1px solid #eee', position: 'relative' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code.nodejs}
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
      
      {/* Package dependencies information */}
      <Box 
        sx={{ 
          mt: 2, 
          p: 2, 
          borderRadius: 1, 
          bgcolor: 'rgba(0,0,0,0.03)',
          border: '1px dashed rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Node.js Package Dependencies
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Basic functionality: No additional packages required. <br/>
          HTTP requests: <code>npm install axios</code> <br/>
          Database: <code>npm install mongoose</code> (MongoDB) or <code>npm install pg</code> (PostgreSQL)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <i>Note: Install packages using npm/pip in your MCP server's environment before using them.</i>
        </Typography>
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
