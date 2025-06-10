import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Popover,
  Paper,
  Chip,
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import axios from "axios";
import { useUserContext } from "../../providers/UserProvider";
import { useDynamicSnackbar } from "../../hooks/useDynamicSnackbar";
import { useMcpServers } from "./context/McpServerContext";

const API_BASE = "http://localhost:3000/v1/api/mcp-server";

interface McpCreateAndUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  editServer: any | null;
}

const McpCreateAndUpdateDialog: React.FC<McpCreateAndUpdateDialogProps> = ({
  open,
  onClose,
  editServer,
}) => {
  const { user } = useUserContext();
  const showSnackbar = useDynamicSnackbar();
  const { invalidateServers } = useMcpServers();
  const [form, setForm] = useState({
    name: "",
    language: "javascript"
  });
  const [loading, setLoading] = useState(false);

  // For info popover
  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
  const infoOpen = Boolean(infoAnchorEl);

  // Reset form when dialog opens/closes or editServer changes
  useEffect(() => {
    if (open) {
      setForm({
        name: editServer?.mcpServerName || "",
        language: "javascript" // Always default to JavaScript
      });
    }
  }, [editServer, open]);

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null,
  ) => {
    if (newLanguage !== null) {
      setForm({ ...form, language: newLanguage });
    }
  };

  const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setInfoAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setInfoAnchorEl(null);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      showSnackbar("Server name is required", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!user?.userId || !token) {
      showSnackbar("User not authenticated", "error");
      return;
    }

    setLoading(true);
    try {
      if (editServer) {
        // UPDATE logic
        await axios.patch(
          `${API_BASE}/update/${editServer.mcpServerId}`,
          {
            mcpServerName: form.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        showSnackbar("MCP Server updated successfully!", "success");
      } else {
        // CREATE logic
        await axios.post(
          `${API_BASE}/create`,
          {
            userId: user.userId,
            mcpServerCreatorId: user.userId,
            mcpServerName: form.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        showSnackbar("MCP Server created successfully!", "success");
      }

      // Important: This order matters for state updates
      invalidateServers(); // Refresh the list
      onClose(); // Close the dialog
    } catch (err: any) {
      showSnackbar(
        `Failed to ${editServer ? 'update' : 'create'} MCP Server: ` +
        (err.response?.data?.message || err.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        {editServer ? "UPDATE MCP SERVER" : "CREATE MCP SERVER"}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          label="Server Name"
          fullWidth
          margin="normal"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          disabled={loading}
          autoFocus
        />

        {/* Language Selection */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography
            variant="body1"
            fontWeight="500"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Tool Language
            <IconButton
              size="small"
              color="primary"
              onClick={handleInfoClick}
              sx={{ ml: 0.5 }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Typography>

          <ToggleButtonGroup
            value={form.language}
            exclusive
            onChange={handleLanguageChange}
            aria-label="tool language"
            fullWidth
          >
            <ToggleButton value="javascript" aria-label="Vanilla JavaScript">
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                <div className="mb-3"><i className="fa-brands fa-square-js" style={{ fontSize: '48px' }}></i></div>
                <Typography variant="body2" fontWeight={600}>Vanilla JavaScript</Typography>
              </Box>
            </ToggleButton>

            <Tooltip title="Coming soon!" placement="top">
              <span style={{ width: '100%', margin: '0 4px' }}>
                <ToggleButton
                  value="node"
                  aria-label="Node.js"
                  disabled
                  sx={{ width: '100%' }}
                >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative',
                    pt: 1
                  }}>
                    <div className="mb-3"><i className="fa-brands fa-node" style={{ fontSize: '48px' }}></i></div>
                    <Typography className="mb-2" variant="body2" fontWeight={600}>NODE.JS</Typography>
                    <Chip
                      label="COMING SOON"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </ToggleButton>
              </span>
            </Tooltip>

            <Tooltip title="Coming soon!" placement="top">
              <span style={{ width: '100%' }}>
                <ToggleButton
                  value="python"
                  aria-label="Python"
                  disabled
                  sx={{ width: '100%' }}
                >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative',
                    pt: 1
                  }}>
                    <div className="mb-3"><i className="fa-brands fa-python" style={{ fontSize: '48px' }}></i></div>
                    <Typography className="mb-2" variant="body2" fontWeight={600}>PYTHON</Typography>
                    <Chip
                      label="COMING SOON"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </ToggleButton>
              </span>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>
      </DialogContent>

      {/* Info Popover */}
      <Popover
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2.5, maxWidth: 320 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            VANILLA JAVASCRIPT
          </Typography>
          <Typography variant="body2">
            Best for 3rd party API integration and basic functionality.
            Run JavaScript code directly in the browser environment with access to standard
            Web APIs and custom integrations.
          </Typography>
        </Paper>
      </Popover>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ fontWeight: 500 }}
        >
          CANCEL
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ fontWeight: 500 }}
        >
          {editServer ? "UPDATE" : "CREATE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default McpCreateAndUpdateDialog;
