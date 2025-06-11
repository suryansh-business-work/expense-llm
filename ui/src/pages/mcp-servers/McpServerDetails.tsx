import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Avatar,
  Skeleton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import StorageIcon from "@mui/icons-material/Storage";
import BuildIcon from "@mui/icons-material/Build";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import DeleteIcon from "@mui/icons-material/Delete";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import CircularProgress from "@mui/material/CircularProgress";

// Import the delete dialog component
import McpDeleteDialog from "./McpDeleteDialog";

const McpServerDetails = () => {
  const { mcpServerId } = useParams<{ mcpServerId: string }>();
  const navigate = useNavigate();
  
  // State for compact UI mode
  const [compactMode, setCompactMode] = useState(true);
  
  // State for server data
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolCount, setToolCount] = useState(0);
  
  // State for edit dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingServer, setEditingServer] = useState<any>({
    mcpServerName: "",
    description: "",
    images: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State for copy notification
  const [copySnackbar, setCopySnackbar] = useState(false);
  
  // Fetch server details
  const getServerDetails = useCallback(async () => {
    if (!mcpServerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/get/${mcpServerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.status === "success") {
        setServer(result.data || null);
        setToolCount(result.data?.toolCount || 0);
        
        // Initialize edit form with current values
        setEditingServer({
          mcpServerName: result.data?.mcpServerName || "",
          description: result.data?.description || "A powerful MCP server for your automation needs.",
          images: result.data?.images || []
        });
      } else {
        setError(result.message || "Failed to load server details");
      }
    } catch (err: any) {
      console.error("Error fetching server details:", err);
      setError(err.message || "An error occurred while fetching server details");
    } finally {
      setLoading(false);
    }
  }, [mcpServerId]);
  
  // Update server details
  const handleUpdateServer = async () => {
    if (!mcpServerId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/update/${mcpServerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mcpServerName: editingServer.mcpServerName,
          description: editingServer.description,
          images: editingServer.images
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.status === "success") {
        // Close dialog and refresh server details
        setOpenEditDialog(false);
        getServerDetails();
      } else {
        setSaveError(result.message || "Failed to update server details");
      }
    } catch (err: any) {
      console.error("Error updating server:", err);
      setSaveError(err.message || "An error occurred while updating server details");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle file upload for images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // For now, we'll just simulate image URLs
    // In a real app, you'd upload these to your server/cloud storage
    const newImages = [...editingServer.images];
    
    Array.from(files).forEach(file => {
      // Create a temporary URL for the image
      const imageUrl = URL.createObjectURL(file);
      newImages.push(imageUrl);
    });
    
    setEditingServer({
      ...editingServer,
      images: newImages.slice(0, 5) // Limit to 5 images max
    });
  };
  
  // Remove an image
  const handleRemoveImage = (index: number) => {
    const newImages = [...editingServer.images];
    newImages.splice(index, 1);
    
    setEditingServer({
      ...editingServer,
      images: newImages
    });
  };
  
  // Load server details on component mount
  useEffect(() => {
    getServerDetails();
  }, [getServerDetails]);
  
  // Handle edit dialog open/close
  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSaveError(null);
  };

  // Handle server deletion success
  const handleDeleteSuccess = () => {
    // Navigate back to the server list
    navigate('/lab/mcp-servers/your-servers');
  };
  
  // Handle copy of server path
  const handleCopyPath = () => {
    const ssePath = `http://localhost:3001/${mcpServerId}/mcp/sse`;
    navigator.clipboard.writeText(ssePath)
      .then(() => setCopySnackbar(true))
      .catch(err => console.error('Failed to copy path:', err));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="text" width={300} height={60} />
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={90} height={36} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mt: 2 }} />
      </Box>
    );
  }

  // Compact view
  if (compactMode) {
    return (
      <>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid #f0f0f0",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            {/* Server name and tool count */}
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                sx={{ 
                  bgcolor: "primary.main", 
                  width: 42, 
                  height: 42, 
                  fontSize: 18,
                  fontWeight: "bold"
                }}
              >
                {server?.mcpServerName?.charAt(0)?.toUpperCase() || "S"}
              </Avatar>
              
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary">
                  {server?.mcpServerName || "Unnamed Server"}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <BuildIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {toolCount} tool{toolCount !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* URL with copy button */}
            <Box 
              sx={{ 
                flex: "1 1 auto",
                display: "flex", 
                justifyContent: "center",
                px: 2,
                maxWidth: { xs: '100%', md: '50%' }
              }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  border: "1px solid #e0e0e0",
                  borderRadius: 6,
                  py: 0.5,
                  px: 2,
                  bgcolor: "#f8fafd",
                  maxWidth: '100%'
                }}
              >
                <Typography
                  noWrap
                  sx={{ 
                    fontSize: 13,
                    fontFamily: "monospace",
                    color: "text.secondary"
                  }}
                >
                  http://localhost:3001/{mcpServerId}/mcp/sse
                </Typography>
                <Tooltip title="Copy endpoint URL">
                  <IconButton 
                    size="small"
                    onClick={handleCopyPath}
                    sx={{ 
                      ml: 1,
                      color: "primary.main",
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Action buttons */}
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Expand view">
                <Button 
                  size="small"
                  variant="outlined"
                  onClick={() => setCompactMode(false)}
                  startIcon={<AspectRatioIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Expand
                </Button>
              </Tooltip>
              
              <Tooltip title="Edit server">
                <IconButton
                  onClick={handleOpenEditDialog}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete server">
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Copy success notification */}
        <Snackbar
          open={copySnackbar}
          autoHideDuration={3000}
          onClose={() => setCopySnackbar(false)}
          message="Server endpoint copied to clipboard"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        {/* Edit Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={handleCloseEditDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={600}>
                Edit Server Details
              </Typography>
              <IconButton onClick={handleCloseEditDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {saveError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {saveError}
              </Alert>
            )}
            
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
              Server Name*
            </Typography>
            <TextField
              value={editingServer.mcpServerName}
              onChange={(e) => setEditingServer({ 
                ...editingServer, 
                mcpServerName: e.target.value 
              })}
              fullWidth
              variant="outlined"
              placeholder="Enter a name for your server"
              size="small"
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
              Description
            </Typography>
            <TextField
              value={editingServer.description}
              onChange={(e) => setEditingServer({ 
                ...editingServer, 
                description: e.target.value 
              })}
              fullWidth
              variant="outlined"
              placeholder="Describe what this server does"
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Server Images
            </Typography>
            <Box sx={{ mb: 3 }}>
              <div className="row g-2">
                {editingServer.images.map((img: string, index: number) => (
                  <div className="col-6 col-sm-4 col-md-3" key={index}>
                    <Box
                      sx={{
                        position: "relative",
                        height: 150,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <img 
                        src={img} 
                        alt={`Server ${index + 1}`} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover" 
                        }} 
                      />
                      <IconButton
                        onClick={() => handleRemoveImage(index)}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          background: "rgba(0,0,0,0.5)",
                          color: "#fff",
                          "&:hover": { background: "rgba(0,0,0,0.7)" }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </div>
                ))}
                
                {editingServer.images.length < 5 && (
                  <div className="col-6 col-sm-4 col-md-3">
                    <Box
                      sx={{
                        height: 150,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #ccc",
                        cursor: "pointer",
                        "&:hover": { borderColor: "#1976d2" }
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                        multiple
                      />
                      <AddPhotoAlternateIcon 
                        sx={{ fontSize: 36, color: "#1976d2", mb: 1 }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        Add Image
                      </Typography>
                    </Box>
                  </div>
                )}
              </div>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Upload up to 5 images. Recommended size: 1200x800px.
              </Typography>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleCloseEditDialog}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleUpdateServer}
              disabled={!editingServer.mcpServerName || isSaving}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(25,118,210,0.12)",
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Dialog */}
        <McpDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          mcpServerId={mcpServerId || ""}
          serverName={server?.mcpServerName || ""}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </>
    );
  }

  // Regular detailed view (existing code)
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Compact mode toggle - NEW */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" fontWeight={500}>
                Compact UI
              </Typography>
            }
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 2, sm: 0 }}
          mb={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary">
              {server?.mcpServerName || "Unnamed Server"}
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              ID: {server?.mcpServerId}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenEditDialog}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(25,118,210,0.12)",
              }}
            >
              Edit Server
            </Button>
            
            {/* Add Delete button */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 600,
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Server Connection Details - NEW SECTION */}
        <Box 
          sx={{ 
            mb: 4, 
            p: 2.5, 
            borderRadius: 3,
            bgcolor: "#f0f7ff",
            border: "1px solid rgba(25,118,210,0.2)"
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <SettingsEthernetIcon sx={{ color: "primary.main", mr: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Connection Information
            </Typography>
            <Chip 
              label="SSE Transport" 
              size="small" 
              color="primary"
              sx={{ ml: 2, fontWeight: 500 }}
            />
          </Box>
          
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                Server Endpoint
              </Typography>
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 1,
                  bgcolor: "#fff"
                }}
              >
                <Typography
                  sx={{ 
                    flex: 1,
                    fontSize: 13,
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "text.primary"
                  }}
                >
                  http://localhost:3001/{mcpServerId}/mcp/sse
                </Typography>
                <Tooltip title="Copy endpoint URL">
                  <IconButton 
                    size="small"
                    onClick={handleCopyPath}
                    sx={{ 
                      ml: 1,
                      color: "primary.main",
                      bgcolor: "rgba(25,118,210,0.08)",
                      "&:hover": {
                        bgcolor: "rgba(25,118,210,0.15)",
                      }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                Transport Type
              </Typography>
              <Box 
                sx={{ 
                  p: 1, 
                  display: "flex", 
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  bgcolor: "#fff",
                  height: 48
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: "50%", 
                    bgcolor: "#4caf50",
                    display: "inline-block"
                  }} 
                />
                <Typography fontWeight={500}>SSE (Server-Sent Events)</Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Use this endpoint to establish a real-time connection with the MCP server.
          </Typography>
        </Box>
        
        <div className="row">
          <div className="col-12 col-md-7">
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Server Details
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                Description
              </Typography>
              <Typography variant="body1">
                {server?.description || "No description available."}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                Created At
              </Typography>
              <Typography variant="body1">
                {server?.createdAt ? new Date(server.createdAt).toLocaleString() : "N/A"}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                Creator ID
              </Typography>
              <Typography variant="body1">
                {server?.mcpServerCreatorId || "N/A"}
              </Typography>
            </Box>
          </div>
          
          <div className="col-12 col-md-5">
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Performance Metrics
            </Typography>
            
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 2 
              }}
            >
              <Paper 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: "#f8fafd",
                  border: "1px solid #edf2f7"
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "#e3f2fd", width: 40, height: 40 }}>
                    <BuildIcon sx={{ color: "#1976d2" }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {toolCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tools
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: "#f8fafd",
                  border: "1px solid #edf2f7"
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "#e8f5e9", width: 40, height: 40 }}>
                    <StorageIcon sx={{ color: "#43a047" }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      100%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </div>
        </div>
      </Paper>

      {/* Copy success notification */}
      <Snackbar
        open={copySnackbar}
        autoHideDuration={3000}
        onClose={() => setCopySnackbar(false)}
        message="Server endpoint copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              Edit Server Details
            </Typography>
            <IconButton onClick={handleCloseEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {saveError}
            </Alert>
          )}
          
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            Server Name*
          </Typography>
          <TextField
            value={editingServer.mcpServerName}
            onChange={(e) => setEditingServer({ 
              ...editingServer, 
              mcpServerName: e.target.value 
            })}
            fullWidth
            variant="outlined"
            placeholder="Enter a name for your server"
            size="small"
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            Description
          </Typography>
          <TextField
            value={editingServer.description}
            onChange={(e) => setEditingServer({ 
              ...editingServer, 
              description: e.target.value 
            })}
            fullWidth
            variant="outlined"
            placeholder="Describe what this server does"
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Server Images
          </Typography>
          <Box sx={{ mb: 3 }}>
            <div className="row g-2">
              {editingServer.images.map((img: string, index: number) => (
                <div className="col-6 col-sm-4 col-md-3" key={index}>
                  <Box
                    sx={{
                      position: "relative",
                      height: 150,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img 
                      src={img} 
                      alt={`Server ${index + 1}`} 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover" 
                      }} 
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        background: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        "&:hover": { background: "rgba(0,0,0,0.7)" }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </div>
              ))}
              
              {editingServer.images.length < 5 && (
                <div className="col-6 col-sm-4 col-md-3">
                  <Box
                    sx={{
                      height: 150,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #ccc",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#1976d2" }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                      multiple
                    />
                    <AddPhotoAlternateIcon 
                      sx={{ fontSize: 36, color: "#1976d2", mb: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      Add Image
                    </Typography>
                  </Box>
                </div>
              )}
            </div>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Upload up to 5 images. Recommended size: 1200x800px.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseEditDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleUpdateServer}
            disabled={!editingServer.mcpServerName || isSaving}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(25,118,210,0.12)",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <McpDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        mcpServerId={mcpServerId || ""}
        serverName={server?.mcpServerName || ""}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default McpServerDetails;
