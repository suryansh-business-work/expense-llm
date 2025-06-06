import React, { useState } from "react";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { useMcpServers } from "./context/McpServerContext";
import { useDynamicSnackbar } from "../../hooks/useDynamicSnackbar";

const API_BASE = "http://localhost:3000/v1/api/mcp-server";

interface McpDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  deleteServerId: string | null;
}

const McpDeleteDialog: React.FC<McpDeleteDialogProps> = ({
  open,
  onClose,
  deleteServerId,
}) => {
  const [loading, setLoading] = useState(false);
  const { invalidateServers } = useMcpServers();
  const showSnackbar = useDynamicSnackbar();

  const handleDelete = async () => {
    if (!deleteServerId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/delete/${deleteServerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Important: This order matters
      showSnackbar("MCP Server deleted successfully!", "success");
      invalidateServers(); // Refresh the list
      onClose(); // Close the dialog
    } catch (err) {
      showSnackbar("Failed to delete MCP Server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Are you sure you want to delete this server?</DialogTitle>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default McpDeleteDialog;