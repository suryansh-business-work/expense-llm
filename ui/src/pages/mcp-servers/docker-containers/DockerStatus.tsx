import React, { useEffect, useState } from "react";
import {
  Chip,
  Drawer,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Divider,
  Tooltip,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

const DOCKER_INFO_API = "http://localhost:3000/v1/api/code-run/docker-info";

const DockerStatus: React.FC = () => {
  const [dockerInfo, setDockerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch Docker info
  const fetchDockerInfo = () => {
    setLoading(true);
    fetch(DOCKER_INFO_API)
      .then((res) => res.json())
      .then((data) => {
        setDockerInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDockerInfo();
  }, []);

  // On chip click, open drawer and refresh status
  const handleChipClick = () => {
    fetchDockerInfo();
    setDrawerOpen(true);
  };

  return (
    <>
      <Chip
        icon={
          loading ? (
            <CircularProgress size={12} color="inherit" />
          ) : (
            <FiberManualRecordIcon
              sx={{
                color:
                  dockerInfo?.status === "running"
                    ? "#4caf50"
                    : "#f44336",
                fontSize: 14,
              }}
            />
          )
        }
        label={
          loading
            ? "Checking Docker..."
            : dockerInfo?.status === "running"
            ? "Docker Running"
            : "Docker Down"
        }
        color={dockerInfo?.status === "running" ? "success" : "error"}
        variant="outlined"
        size="small"
        onClick={handleChipClick}
        sx={{
          cursor: "pointer",
          fontWeight: 600,
          borderWidth: 2,
          borderColor:
            dockerInfo?.status === "running"
              ? "#4caf50"
              : "#f44336",
          bgcolor:
            dockerInfo?.status === "running"
              ? "#e8f5e9"
              : "#ffebee",
          transition: "all 0.2s",
        }}
      />

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 420 }, p: 3, bgcolor: "#f7f8fa" },
        }}
      >
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <FiberManualRecordIcon
            sx={{
              color:
                dockerInfo?.status === "running" ? "#4caf50" : "#f44336",
              fontSize: 18,
            }}
          />
          <Typography variant="h6" fontWeight={700}>
            Docker Status
          </Typography>
          <Tooltip title="Docker engine and environment details" arrow>
            <InfoOutlinedIcon sx={{ color: "#1976d2", fontSize: 20, ml: 0.5 }} />
          </Tooltip>
          <Tooltip title="Refresh Docker Status" arrow>
            <Box
              component="span"
              sx={{
                ml: "auto",
                display: "flex",
                alignItems: "center",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
              onClick={() => !loading && fetchDockerInfo()}
            >
              <RefreshIcon
                sx={{
                  fontSize: 22,
                  color: "#1976d2",
                  transition: "transform 0.2s",
                  ...(loading && {
                    animation: "spin 1s linear infinite",
                  }),
                  "@keyframes spin": {
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </Box>
          </Tooltip>
        </Box>
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading Docker info...</Typography>
          </Box>
        ) : dockerInfo ? (
          <Box>
            <List
              subheader={
                <ListSubheader component="div" sx={{ bgcolor: "#ffffff", fontWeight: 700, border: '1px solid #cfcfcf' }}>
                  General
                </ListSubheader>
              }
            >
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    dockerInfo.status === "running" ? (
                      <span style={{ color: "#4caf50", fontWeight: 600 }}>Running</span>
                    ) : (
                      <span style={{ color: "#f44336", fontWeight: 600 }}>Not Running</span>
                    )
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Version" secondary={dockerInfo.version || "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="API Version" secondary={dockerInfo.apiVersion || "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Server Version" secondary={dockerInfo.serverVersion || "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Operating System" secondary={dockerInfo.operatingSystem || "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Containers" secondary={dockerInfo.containers ?? "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Images" secondary={dockerInfo.images ?? "-"} />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <List
              subheader={
                <ListSubheader component="div" sx={{ bgcolor: "#ffffff", fontWeight: 700, border: '1px solid #cfcfcf' }}>
                  Details
                </ListSubheader>
              }
            >
              <ListItem>
                <ListItemText
                  primary="Kernel Version"
                  secondary={dockerInfo.info?.KernelVersion || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="CPU Cores"
                  secondary={dockerInfo.info?.NCPU || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Memory"
                  secondary={
                    dockerInfo.info?.MemTotal
                      ? `${(dockerInfo.info.MemTotal / (1024 * 1024 * 1024)).toFixed(2)} GB`
                      : "-"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Docker Root Dir"
                  secondary={dockerInfo.info?.DockerRootDir || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Server Name"
                  secondary={dockerInfo.info?.Name || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Running Containers"
                  secondary={dockerInfo.info?.ContainersRunning ?? "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Paused Containers"
                  secondary={dockerInfo.info?.ContainersPaused ?? "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Stopped Containers"
                  secondary={dockerInfo.info?.ContainersStopped ?? "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Driver"
                  secondary={dockerInfo.info?.Driver || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Cgroup Driver"
                  secondary={dockerInfo.info?.CgroupDriver || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Architecture"
                  secondary={dockerInfo.info?.Architecture || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="OSType"
                  secondary={dockerInfo.info?.OSType || "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="System Time"
                  secondary={dockerInfo.info?.SystemTime || "-"}
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Plugins
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Volume:{" "}
                {(dockerInfo.info?.Plugins?.Volume || []).join(", ") || "-"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Network:{" "}
                {(dockerInfo.info?.Plugins?.Network || []).join(", ") || "-"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Log:{" "}
                {(dockerInfo.info?.Plugins?.Log || []).join(", ") || "-"}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Security & Resources
            </Typography>
            <Box>
              <Typography variant="body2">
                <b>Memory Limit:</b> {dockerInfo.info?.MemoryLimit ? "Enabled" : "Disabled"}
              </Typography>
              <Typography variant="body2">
                <b>Swap Limit:</b> {dockerInfo.info?.SwapLimit ? "Enabled" : "Disabled"}
              </Typography>
              <Typography variant="body2">
                <b>CPU Shares:</b> {dockerInfo.info?.CPUShares ? "Enabled" : "Disabled"}
              </Typography>
              <Typography variant="body2">
                <b>CPU Set:</b> {dockerInfo.info?.CPUSet ? "Enabled" : "Disabled"}
              </Typography>
              <Typography variant="body2">
                <b>Pids Limit:</b> {dockerInfo.info?.PidsLimit ? "Enabled" : "Disabled"}
              </Typography>
              <Typography variant="body2">
                <b>IPv4 Forwarding:</b> {dockerInfo.info?.IPv4Forwarding ? "Enabled" : "Disabled"}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Warnings
            </Typography>
            <Box>
              {(dockerInfo.info?.Warnings || []).length > 0 ? (
                (dockerInfo.info.Warnings as string[]).map((w, i) => (
                  <Typography key={i} variant="body2" color="error">
                    {w}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="success.main">
                  No warnings
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Typography color="error" sx={{ mt: 4 }}>
            Failed to load Docker info.
          </Typography>
        )}
      </Drawer>
    </>
  );
};

export default DockerStatus;