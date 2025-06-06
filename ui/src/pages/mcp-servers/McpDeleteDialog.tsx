import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDynamicSnackbar } from "../../hooks/useDynamicSnackbar";

interface McpDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  mcpServerId: string;
  serverName: string;
  onDeleteSuccess: () => void;
}

const McpDeleteDialog: React.FC<McpDeleteDialogProps> = ({
  open,
  onClose,
  mcpServerId,
  serverName,
  onDeleteSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showSnackbar = useDynamicSnackbar();

  const handleDelete = async () => {
    if (!mcpServerId) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/delete/${mcpServerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.status === "success") {
        showSnackbar("MCP Server deleted successfully!", "success");
        onClose();
        onDeleteSuccess();
      } else {
        setError(result.message || "Failed to delete server");
      }
    } catch (err: any) {
      console.error("Error deleting server:", err);
      setError(err.message || "An error occurred while deleting the server");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!isDeleting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={600}>
          Delete MCP Server
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          py: 2
        }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 32, color: 'error.main' }} />
          </Box>
          
          <Typography variant="h6" align="center" sx={{ mb: 1 }}>
            Are you sure you want to delete this server?
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
            You are about to delete "<strong>{serverName}</strong>". This action cannot be undone, and all associated tools and data will be permanently removed.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isDeleting}
          sx={{ 
            borderRadius: 2,
            px: 3,
            mr: 1,
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteOutlineIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            boxShadow: '0 4px 12px rgba(211,47,47,0.2)'
          }}
        >
          {isDeleting ? "Deleting..." : "Delete Server"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default McpDeleteDialog;