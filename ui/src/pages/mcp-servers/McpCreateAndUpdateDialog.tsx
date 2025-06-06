import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Box,
  TextField,
  Button,
} from "@mui/material";
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
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or editServer changes
  useEffect(() => {
    if (open) {
      setForm({ name: editServer?.mcpServerName || "" });
    }
  }, [editServer, open]);

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
      maxWidth="xs" 
      fullWidth
    >
      <DialogTitle>{editServer ? "Update MCP Server" : "Create MCP Server"}</DialogTitle>
      <Box component="form" sx={{ px: 3, py: 2 }}>
        <TextField
          label="Server Name"
          fullWidth
          margin="normal"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          disabled={loading}
          autoFocus
        />
      </Box>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {editServer ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default McpCreateAndUpdateDialog;