import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from 'axios';

interface ToolDetailsSectionProps {
  mcpServerId: string;
}

const ToolDetailsSection: React.FC<ToolDetailsSectionProps> = ({ mcpServerId }) => {
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolData, setToolData] = useState<any>(null);
  const [serverName, setServerName] = useState("Loading...");
  
  // Fetch tool and server data
  useEffect(() => {
    const fetchData = async () => {
      if (!toolId) return;
      
      try {
        // Get auth token
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch server name
        const serverRes = await axios.get(`http://localhost:3000/v1/api/mcp-server/get/${mcpServerId}`, { headers });
        if (serverRes.data?.data) {
          setServerName(serverRes.data.data.mcpServerName || "Unknown Server");
        }
        
        // Fetch tool details
        const toolRes = await axios.get(`http://localhost:3000/v1/api/mcp-server/tool/get/${toolId}`, { headers });
        if (toolRes.data?.data) {
          setToolData(toolRes.data.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load tool data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mcpServerId, toolId]);

  return (
    <>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/lab/mcp-server/your-server/${mcpServerId}`)}
          sx={{
            background: "#e3eafc",
            color: "#1976d2",
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            py: 1,
            mr: 2,
            boxShadow: "none",
            "&:hover": { background: "#d2e3fc" },
          }}
          variant="contained"
          size="small"
        >
          Back to Server
        </Button>
      </Box>
      
      {/* Tool Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : toolData && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Server: {serverName}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {toolData.toolName || "Unnamed Tool"}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Typography variant="body2" color="text.secondary">
                ID: {toolData.toolId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated: {toolData.updatedAt ? new Date(toolData.updatedAt).toLocaleString() : "N/A"}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default ToolDetailsSection;