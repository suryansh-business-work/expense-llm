import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

interface DeleteToolProps {
  open: boolean;
  onClose: () => void;
  tool: any; // The tool to delete
  onSuccess?: () => void;
}

const DeleteDialogTool = ({ open, onClose, tool, onSuccess }: DeleteToolProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API call to delete the tool
  const handleDeleteTool = async () => {
    if (!tool?.toolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/tool/delete/${tool.toolId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.status === "success") {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(result.message || "Failed to delete tool");
      }
    } catch (err: any) {
      console.error("Error deleting tool:", err);
      setError(err.message || "An error occurred while deleting the tool");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{ sx: { borderRadius: 2 } }}
      aria-labelledby="delete-tool-dialog-title"
      aria-describedby="delete-tool-dialog-description"
    >
      <DialogTitle id="delete-tool-dialog-title">
        Confirm Tool Deletion
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" color="text.secondary">
          Are you sure you want to delete the tool <strong>"{tool?.toolName}"</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeleteTool}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          sx={{ borderRadius: 2 }}
        >
          {loading ? "Deleting..." : "Delete Tool"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialogTool;