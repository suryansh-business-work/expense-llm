import React, { useState } from "react";
import {
  Box,
  Card,
  CardActions,
  CardHeader,
  Button,
  Typography,
  Skeleton,
  Divider,
  Tooltip,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Badge,
  Rating,
  Menu,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import StorageIcon from "@mui/icons-material/Storage";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import SortIcon from "@mui/icons-material/Sort";
import LaunchIcon from "@mui/icons-material/Launch";
import VerifiedIcon from "@mui/icons-material/Verified";
import McpDeleteDialog from "./McpDeleteDialog";
import { useMcpServers } from "./context/McpServerContext";
import { useUserContext } from "../../providers/UserProvider";
import { useNavigate } from "react-router-dom";
import McpCreateAndUpdateDialog from "./McpCreateAndUpdateDialog";

const YourMcpServer = () => {
  const { servers, loading, invalidateServers } = useMcpServers();
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [editServer, setEditServer] = useState<any | null>(null);
  const [deleteServerId, setDeleteServerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Calculate total tools across all servers
  const totalTools = servers.reduce((sum, server) => sum + (server.toolCount || 0), 0);

  // Filter and sort servers
  const filteredServers = servers.filter(server =>
    server.mcpServerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.mcpServerId?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.avgRating || 0) - (a.avgRating || 0);
      case "name":
        return (a.mcpServerName || "").localeCompare(b.mcpServerName || "");
      case "tools":
        return (b.toolCount || 0) - (a.toolCount || 0);
      case "oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "newest":
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  // Handle create/update dialog open
  const handleOpenDialog = (server?: any) => {
    setEditServer(server || null);
    setOpenDialog(true);
  };

  // Handle sorting
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortSelect = (sortValue: string) => {
    setSortBy(sortValue);
    setAnchorEl(null);
  };

  const handleDeleteSuccess = () => {
    // Reload the server list
    invalidateServers();
    
    // You might not need to navigate if you're already on the server list page
    // If this function is used from a detail page, keep the navigation
    // navigate('/lab/mcp-servers/your-servers');
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  // Go to server detail page
  const handleGoToServer = (serverId: string) => {
    navigate(`/lab/mcp-server/your-server/${serverId}`);
  };

  return (
    <div>
      {/* Header with Stats and Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <StorageIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Your MCP Servers
            </Typography>
            <Box display="flex" gap={1} mt={0.5}>
              <Chip
                icon={<StorageIcon sx={{ fontSize: 16 }} />}
                label={`${servers.length} Servers`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<BuildIcon sx={{ fontSize: 16 }} />}
                label={`${totalTools} Tools`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          <Tooltip title="Create your own MCP servers and publish them to the marketplace for others to use." arrow>
            <InfoOutlinedIcon sx={{ color: "#1976d2", fontSize: 20, ml: 0.5, cursor: "pointer" }} />
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", md: "auto" },
            alignItems: "center"
          }}
        >
          <TextField
            placeholder="Search servers..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", md: 220 },
              backgroundColor: "#fff",
              borderRadius: 1,
            }}
          />

          <Tooltip title="Sort Servers">
            <IconButton
              color="primary"
              onClick={handleSortClick}
              sx={{
                backgroundColor: "#fff",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              minHeight: 32,
              px: 2.5,
              py: 0.5,
              fontSize: 15,
              ml: { xs: 0, sm: 1 },
            }}
          >
            Create MCP Server
          </Button>
        </Box>
      </Box>

      {/* Sort Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => handleSortSelect("newest")}>
          <Typography sx={{ fontWeight: sortBy === "newest" ? 700 : 400 }}>
            Newest First
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("oldest")}>
          <Typography sx={{ fontWeight: sortBy === "oldest" ? 700 : 400 }}>
            Oldest First
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("name")}>
          <Typography sx={{ fontWeight: sortBy === "name" ? 700 : 400 }}>
            Server Name
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("rating")}>
          <Typography sx={{ fontWeight: sortBy === "rating" ? 700 : 400 }}>
            Highest Rating
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("tools")}>
          <Typography sx={{ fontWeight: sortBy === "tools" ? 700 : 400 }}>
            Most Tools
          </Typography>
        </MenuItem>
      </Menu>

      <Divider sx={{ mb: 3 }} />

      {/* Server Cards */}
      <div className="row">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, idx) => (
            <div className="col-12 col-sm-6 col-lg-4 mb-4" key={idx}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={230}
                sx={{ borderRadius: 3 }}
              />
            </div>
          ))
        ) : filteredServers.length > 0 ? (
          filteredServers.map((server, index) => (
            <div
              className="col-12 col-sm-6 col-lg-4 mb-4"
              key={server.mcpServerId || server._id || index}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                custom={index}
              >
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {server.verified && (
                    <Chip
                      icon={<VerifiedIcon fontSize="small" />}
                      label="Verified"
                      size="small"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 600, pr: server.verified ? 4 : 0 }}>
                        {server.mcpServerName || "Untitled Server"}
                      </Typography>
                    }
                    subheader={
                      <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
                        ID: {server.mcpServerId}
                      </Typography>
                    }
                  />

                  <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <Box component="span" sx={{ color: "#1976d2", fontWeight: 500 }}>
                          {server.mcpServerCreatorId === user?.userId ?
                            "Launched by You" :
                            `Launched by: ${server.mcpServerCreatorId}`}
                        </Box>
                      </Typography>

                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Created: {server.createdAt ?
                          new Date(server.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "N/A"}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>Rating:</Typography>
                        <Rating
                          value={server.avgRating || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: "#666" }}>
                          ({server.avgRating?.toFixed(1) || "N/A"})
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                      <Chip
                        label={`${server.totalReviews || 0} Reviews`}
                        size="small"
                        variant="outlined"
                      />
                      <Badge
                        badgeContent={server.toolCount || 0}
                        color="primary"
                        max={99}
                      >
                        <Chip
                          icon={<BuildIcon fontSize="small" />}
                          label="Tools"
                          size="small"
                          variant="outlined"
                        />
                      </Badge>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<LaunchIcon />}
                      size="small"
                      onClick={() => handleGoToServer(server.mcpServerId)}
                      sx={{
                        borderRadius: '20px',
                        px: 2,
                        boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)',
                      }}
                    >
                      Go to Server
                    </Button>

                    <Box>
                      <Tooltip title="Edit Server">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(server)}
                          sx={{
                            mr: 1,
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.15)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Server">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteServerId(server.mcpServerId)}
                          sx={{
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.15)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </motion.div>
            </div>
          ))
        ) : (
          <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
            {searchQuery ? (
              <>
                <Typography sx={{ m: 3, color: "#666", fontSize: 18 }}>
                  No MCP servers found matching "{searchQuery}"
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Typography sx={{ m: 3, color: "#666", fontSize: 18 }}>
                  No MCP servers found. Create your first server to get started!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Create MCP Server
                </Button>
              </>
            )}
          </Box>
        )}
      </div>

      {/* Create/Update Dialog */}
      <McpCreateAndUpdateDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditServer(null);
        }}
        editServer={editServer}
      />

      {/* Delete Dialog */}
      <McpDeleteDialog
        open={!!deleteServerId}
        onClose={() => setDeleteServerId(null)}
        mcpServerId={deleteServerId || ""}
        serverName={servers.find(server => server.mcpServerId === deleteServerId)?.mcpServerName || "Unnamed Server"}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default YourMcpServer;
