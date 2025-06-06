import { useState } from "react";
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
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import McpCreateAndUpdateDialog from "./McpCreateAndUpdateDialog";
import McpDeleteDialog from "./McpDeleteDialog";
import { useMcpServers } from "./context/McpServerContext";

const YourMcpServer = () => {
  const { servers, loading } = useMcpServers();
  const [openDialog, setOpenDialog] = useState(false);
  const [editServer, setEditServer] = useState<any | null>(null);
  const [deleteServerId, setDeleteServerId] = useState<string | null>(null);

  // Handle create/update dialog open
  const handleOpenDialog = (server?: any) => {
    if (server) {
      setEditServer(server);
    } else {
      setEditServer(null);
    }
    setOpenDialog(true);
  };

  return (
    <div>
      {/* Header and Create Button */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <StorageIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            MCP Servers
          </Typography>
          <Tooltip title="Create your own MCP servers and publish them to the marketplace for others to use." arrow>
            <InfoOutlinedIcon sx={{ color: "#1976d2", fontSize: 20, ml: 0.5, cursor: "pointer" }} />
          </Tooltip>
        </Box>
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
          }}
        >
          Create MCP Server
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <div className="row">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div className="col-12 col-sm-6 col-md-6 mb-4" key={idx}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.05)",
                    maxWidth: "900px",
                    minHeight: 180,
                    p: 2,
                  }}
                >
                  <Skeleton variant="text" width="60%" height={36} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width={80} height={32} sx={{ mt: 2, borderRadius: 2 }} />
                </Card>
              </div>
            ))
          : servers.length > 0
          ? servers.map((server, index) => (
              <div className="col-12 col-sm-6 col-md-6 mb-4" key={server.mcpServerId || server._id || index}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.05)",
                    maxWidth: "900px",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 18px 36px rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {server.mcpServerName || "Untitled"}
                      </Typography>
                    }
                    subheader={
                      <Typography color="text.secondary" sx={{ fontSize: 15 }}>
                        ID: {server.mcpServerId}
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 500, mb: 1 }}>
                      Launched by: {server.mcpServerCreatorId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      Created: {server.createdAt ? new Date(server.createdAt).toLocaleString() : "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      Avg. Rating: {server.avgRating ?? "N/A"} | Reviews: {server.totalReviews ?? 0}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(server)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteServerId(server.mcpServerId)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </div>
            ))
          : (
            <Typography sx={{ m: 3, color: "#888" }}>
              No MCP servers found. Click "Create MCP Server" to add one.
            </Typography>
          )}
      </div>
      {/* Create/Update Dialog */}
      <McpCreateAndUpdateDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        editServer={editServer}
      />
      {/* Delete Dialog */}
      <McpDeleteDialog
        open={!!deleteServerId}
        onClose={() => setDeleteServerId(null)}
        deleteServerId={deleteServerId}
      />
    </div>
  );
};

export default YourMcpServer;
