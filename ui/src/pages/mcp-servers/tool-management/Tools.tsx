import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  ButtonGroup,
  Tooltip,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ScienceIcon from "@mui/icons-material/Science"; // Add this for Tool Lab icon

// Import tool management components
import CreateAndUpdateToolDialog from "./CreateAndUpdateToolDialog";
import DeleteDialogTool from "./DeleteDialogTool";

interface ToolsProps {
  mcpServerId: string;
}

const Tools: React.FC<ToolsProps> = ({ mcpServerId }) => {
  const navigate = useNavigate(); // Add navigate hook
  
  // State for tools
  const [tools, setTools] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  
  // State for tool dialogs
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedToolForDelete, setSelectedToolForDelete] = useState<any>(null);
  
  // Add navigation handler for Tool Lab
  const handleToolLabClick = (tool: any) => {
    navigate(`/lab/mcp-server/your-server/${mcpServerId}/tool/${tool.toolId}`);
  };

  // Fetch tools for this server
  const getServerTools = useCallback(async () => {
    if (!mcpServerId) return;
    
    setToolsLoading(true);
    setToolsError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/tool/list/${mcpServerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      
      const result = await res.json();
      
      // Special case for "no-data-found" - don't treat as error
      if (result.status === "no-data-found" || (result.data && result.data.length === 0)) {
        setTools([]);
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      if (result.status === "success") {
        setTools(result.data || []);
      } else {
        setToolsError(result.message || "Failed to load tools");
      }
    } catch (err: any) {
      console.error("Error fetching tools:", err);
      if (err.message !== "No tools found for this server") {
        setToolsError(err.message || "An error occurred while fetching tools");
      }
    } finally {
      setToolsLoading(false);
    }
  }, [mcpServerId]);
  
  // Handle tool actions
  const handleAddTool = () => {
    setSelectedTool(null);
    setToolDialogOpen(true);
  };
  
  const handleEditTool = (tool: any) => {
    setSelectedTool(tool);
    setToolDialogOpen(true);
  };
  
  const handleToolDialogClose = () => {
    setToolDialogOpen(false);
  };
  
  const handleToolSuccess = () => {
    getServerTools();
  };
  
  // Load tools on component mount
  useEffect(() => {
    getServerTools();
  }, [getServerTools]);

  return (
    <>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Server Tools
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<BuildIcon />}
            sx={{ borderRadius: 2 }}
            onClick={handleAddTool}
          >
            Add Tool
          </Button>
        </Box>
        
        {toolsLoading ? (
          <Box sx={{ p: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary" display="inline">
              Loading tools...
            </Typography>
          </Box>
        ) : toolsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>{toolsError}</Alert>
        ) : tools.length > 0 ? (
          <TableContainer component={Paper} sx={{ 
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid #edf2f7',
            overflow: 'hidden'
          }}>
            <Table sx={{ minWidth: 650 }} aria-label="tools table">
              <TableHead sx={{ bgcolor: '#f8fafd' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tool Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Parameters</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow 
                    key={tool.toolId}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            fontSize: 14
                          }}
                        >
                          {tool.toolName?.charAt(0)?.toUpperCase() || 'T'}
                        </Avatar>
                        <Typography fontWeight={600} color="text.primary">
                          {tool.toolName}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography 
                        noWrap 
                        sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          color: 'text.secondary'
                        }}
                      >
                        {tool.toolDescription || "No description provided"}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={`${tool.toolParams?.length || 0} parameter${tool.toolParams?.length !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(25,118,210,0.08)', 
                          color: 'primary.main',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <ButtonGroup size="small" variant="outlined">
                        {/* Edit Tool Button */}
                        <Tooltip title="Edit tool">
                          <Button
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTool(tool);
                            }}
                            sx={{ 
                              borderRadius: '4px 0 0 4px',
                              borderColor: 'divider'
                            }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        
                        {/* NEW: Tool Lab Button */}
                        <Tooltip title="Open Tool Lab">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToolLabClick(tool);
                            }}
                            sx={{ 
                              borderRadius: '0',
                              borderLeft: 0,
                              borderRight: 0,
                              borderColor: 'divider',
                              color: 'info.main',
                            }}
                            startIcon={<ScienceIcon fontSize="small" />}
                          >
                            Tool Lab
                          </Button>
                        </Tooltip>
                        
                        {/* Delete Tool Button */}
                        <Tooltip title="Delete tool">
                          <Button
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedToolForDelete(tool);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ 
                              borderRadius: '0 4px 4px 0',
                              minWidth: 40,
                              borderColor: 'divider'
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {tools.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No tools found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box 
            sx={{ 
              p: { xs: 3, sm: 5 },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
              bgcolor: "#fafbfc",
              border: "1px dashed #dce0e6"
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(25,118,210,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3
              }}
            >
              <BuildIcon sx={{ fontSize: 36, color: "primary.main" }} />
            </Box>
            
            <Typography variant="h5" fontWeight={700} color="text.primary" mb={1.5}>
              Power Up Your MCP Server
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: 500, 
                mx: "auto", 
                mb: 3.5,
                lineHeight: 1.6
              }}
            >
              This server has no tools yet. Add your first tool to unlock the full potential of your MCP server and start automating tasks.
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              startIcon={<BuildIcon />}
              onClick={handleAddTool}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                fontWeight: 600,
                boxShadow: "0 6px 16px rgba(25,118,210,0.2)",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(25,118,210,0.3)",
                }
              }}
            >
              Add Your First Tool
            </Button>
            
            <Typography variant="caption" color="text.secondary" mt={3}>
              Tools give your MCP server functionality and purpose
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Tool Create/Update Dialog */}
      <CreateAndUpdateToolDialog
        open={toolDialogOpen}
        onClose={handleToolDialogClose}
        mcpServerId={mcpServerId}
        tool={selectedTool}
        onSuccess={handleToolSuccess}
      />
      
      {/* Delete Tool Dialog */}
      <DeleteDialogTool
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        tool={selectedToolForDelete}
        onSuccess={handleToolSuccess}
      />
    </>
  );
};

export default Tools;