import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  Paper
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useToolContext } from '../context/ToolContext';

interface ToolDetailsSectionProps {
  mcpServerId: string;
}

const ToolDetailsSection: React.FC<ToolDetailsSectionProps> = ({ mcpServerId }) => {
  const navigate = useNavigate();
  const {
    tool,
    loading,
    error,
    serverName,
    handleSave,
    isDirty,
    isSaving,
    saveError
  } = useToolContext();

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
        {!loading && !error && tool && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Server: {serverName}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {tool?.toolName || "Unnamed Tool"}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  color="success"
                  sx={{ borderRadius: 2 }}
                >
                  Test Run
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: isDirty ? "primary.main" : "grey.400",
                    boxShadow: isDirty ? "0 4px 10px rgba(25,118,210,0.15)" : "none"
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </Stack>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip 
                label={tool?.toolStatus} 
                size="small"
                sx={{ 
                  bgcolor: tool?.toolStatus === 'active' ? '#e3fcef' : '#f0f1f3',
                  color: tool?.toolStatus === 'active' ? '#0a7d40' : '#5f6368',
                  textTransform: 'capitalize',
                  fontWeight: 500
                }}
              />
              <Typography variant="body2" color="text.secondary">
                ID: {tool?.toolId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated: {tool?.updatedAt ? new Date(tool.updatedAt).toLocaleString() : "N/A"}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Error message for save operation */}
      {saveError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {saveError}
        </Alert>
      )}
    </>
  );
};

export default ToolDetailsSection;