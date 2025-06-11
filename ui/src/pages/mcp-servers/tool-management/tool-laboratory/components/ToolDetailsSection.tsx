import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, Paper, CircularProgress,
  Tooltip, IconButton, Chip, Divider, useTheme, alpha,
  Collapse, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import axios from 'axios';

interface ToolDetailsSectionProps {
  mcpServerId: string;
}

const ToolDetailsSection: React.FC<ToolDetailsSectionProps> = ({ mcpServerId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toolId } = useParams<{ toolId: string }>();
  const theme = useTheme();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolData, setToolData] = useState<any>(null);
  const [serverName, setServerName] = useState("Loading...");
  const [expandTechnical, setExpandTechnical] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [animationReady, setAnimationReady] = useState(false);

  // New state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 1500);
  };

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
        // Short delay before triggering animations
        setTimeout(() => setAnimationReady(true), 100);
      }
    };

    fetchData();
  }, [mcpServerId, toolId]);

  // Check for passed message from navigation state on component mount
  useEffect(() => {
    if (location.state?.message) {
      setSnackbarMessage(location.state.message);
      setSnackbarOpen(true);
    }
  }, [location]);

  // Update the delete prompt function to open dialog instead
  function handleDeletePrompt(): void {
    setDeleteDialogOpen(true);
  }

  // New function to handle the actual deletion
  async function handleDeleteConfirm(): Promise<void> {
    if (!toolId) return;

    try {
      setIsDeleting(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Update the API endpoint to match the curl command
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:3000/v1/api/mcp-server/tool/delete/${toolId}`, { headers });

      // Navigate back with success message
      navigate(`/lab/mcp-server/your-server/${mcpServerId}`, {
        state: { message: "Tool deleted successfully" }
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to delete tool");
      setDeleteDialogOpen(false);
      setSnackbarMessage("Error deleting tool: " + (err?.response?.data?.message || err.message || "Unknown error"));
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <MotionConfig transition={{
      type: "spring",
      stiffness: 300,
      damping: 30
    }}>
      <AnimatePresence>
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/lab/mcp-server/your-server/${mcpServerId}`)}
                sx={{
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mr: 2,
                  boxShadow: "none",
                  "&:hover": {
                    background: alpha(theme.palette.primary.main, 0.15),
                  },
                }}
                variant="contained"
                size="small"
              >
                Back to Server
              </Button>
            </motion.div>
          </Box>
        </motion.div>

        {/* Tool Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animationReady ? 1 : 0, y: animationReady ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 0,
              mb: 3,
              borderRadius: 2,
              bgcolor: "#fff",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Colored header bar */}
            <Box sx={{
              p: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative code symbols */}
              <Box sx={{
                position: 'absolute',
                top: -5,
                right: 10,
                fontFamily: 'monospace',
                fontSize: '24px',
                opacity: 0.2,
                color: '#fff'
              }}>
                {"{ }"}
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: '#fff' }} />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : toolData && (
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: 1 }}>
                    {serverName}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="white" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <DeveloperModeIcon sx={{ mr: 1, opacity: 0.8 }} />
                      {toolData.toolName || "Unnamed Tool"}
                    </Typography>

                    {/* Replace single menu button with action buttons */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Tooltip title="Delete Tool">
                          <IconButton
                            size="small"
                            sx={{
                              color: 'rgba(255,255,255,0.85)',
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(255,0,0,0.2)'
                              }
                            }}
                            onClick={handleDeletePrompt}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </motion.div>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Tool details */}
            {!loading && !error && toolData && (
              <>
                <Box sx={{ p: 3 }}>
                  {toolData.description && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {toolData.description}
                      </Typography>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {toolData.parameters && toolData.parameters.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                          Parameters
                        </Typography>

                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          mb: 3,
                          '& > *': {
                            transition: 'all 0.2s ease'
                          }
                        }}>
                          {toolData.parameters.map((param: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4 + (idx * 0.05) }}
                            >
                              <Tooltip title={`${param.paramDescription || 'No description'} (${param.paramType || 'any'})`}>
                                <Chip
                                  label={param.paramName}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    }
                                  }}
                                />
                              </Tooltip>
                            </motion.div>
                          ))}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>

                <Divider />

                {/* Technical details section */}
                <Box sx={{ px: 3, py: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setExpandTechnical(!expandTechnical)}
                  >
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: "'Roboto Mono', monospace"
                    }}>
                      <Box component="span" sx={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: toolData.isEnabled === false ? 'error.main' : 'success.main',
                        mr: 1
                      }} />
                      Technical Details
                    </Typography>

                    <IconButton size="small">
                      {expandTechnical ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>

                  <Collapse in={expandTechnical}>
                    <Box sx={{ pt: 1.5, pb: 0.5 }}>
                      <Box display="flex" flexWrap="wrap" gap={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Tool ID
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            borderRadius: 1,
                            p: 0.5,
                            pl: 1.5,
                            border: '1px solid rgba(0,0,0,0.05)',
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: '0.85rem'
                          }}>
                            <Box component="span" mr={1}>
                              {toolId}
                            </Box>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Tooltip title={copySuccess === 'id' ? "Copied!" : "Copy ID"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopy(toolId || '', 'id')}
                                  color={copySuccess === 'id' ? 'success' : 'default'}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </motion.div>
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Last Updated
                          </Typography>
                          <Box sx={{
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: '0.85rem',
                            mt: 0.5
                          }}>
                            {toolData.updatedAt ? new Date(toolData.updatedAt).toLocaleString() : "N/A"}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Box>
              </>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Status indicator (absolute positioned) */}
      {toolData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            px: 2,
            py: 1
          }}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: toolData.isEnabled === false ? 'error.main' : 'success.main',
              boxShadow: `0 0 8px ${toolData.isEnabled === false ? theme.palette.error.main : theme.palette.success.main}`
            }} />
          </Box>
        </motion.div>
      )}

      {/* Add delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.error.main
          }}>
            <WarningIcon color="error" />
            Delete Tool
          </DialogTitle>

          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this tool?
            </Typography>
            <Typography
              variant="body2"
              color="error"
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.error.main, 0.1),
                px: 2,
                py: 1,
                borderRadius: 1,
                fontWeight: 500
              }}
            >
              This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                variant="contained"
                color="error"
                startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Add Snackbar for local error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </MotionConfig>
  );
};

export default ToolDetailsSection;
