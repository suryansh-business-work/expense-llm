// MUI components
import { Box, IconButton, Tooltip, Button, Stack, Typography, Drawer, Divider } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

// MUI icons
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import MenuIcon from "@mui/icons-material/Menu";

// React Router
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Data and utilities
import React, { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

// Dialogs
import FeedbackDialog from "./dialogs/FeedbackDialog";
import SuggestionDialog from "./dialogs/SuggestionDialog";
import InfoDialog from "./dialogs/InfoDialog";
import HelpDialog from "./dialogs/HelpDialog";

const API_BASE = "http://localhost:3000/bot";

const ChatTopPannel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { childBotType, chatBotId } = useParams();
  const isMobile = useMediaQuery("(max-width:727px)");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [openSuggestion, setOpenSuggestion] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  const [botPageData, setBotPageData] = useState<any>(null);
  const [botPageLoading, setBotPageLoading] = useState(true);

  // Fetch bot details by ID (childBotType)
  useEffect(() => {
    if (!childBotType) return;
    setBotPageLoading(true);
    const fetchBotDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/bot-info/${childBotType}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const result = await res.json();
        if (res.ok && result.status === "success") {
          setBotPageData(result.data.bot);
        } else {
          setBotPageData(null);
        }
      } catch {
        setBotPageData(null);
      }
      setBotPageLoading(false);
    };
    fetchBotDetails();
  }, [childBotType]);

  const navLinks = [
    { to: `/bot/${childBotType}/chat/${chatBotId}`, label: "Chat", icon: <ChatIcon fontSize="small" /> },
    { to: `/bot/${childBotType}/chat-settings/${chatBotId}`, label: "Settings", icon: <SettingsIcon fontSize="small" /> },
    { to: `/bot/${childBotType}/lab/${chatBotId}`, label: "Lab", icon: <ScienceIcon fontSize="small" /> },
  ];

  // Helper to check if link is active
  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <Box
      className="chat-top-panel"
      sx={{
        width: "100%",
        px: 0,
        py: 0.5,
        borderBottom: "1px solid #e0e0e0",
        background: "#ffffff",
        minHeight: 38,
      }}
    >
      <div className="container-fluid">
        <div className="row align-items-center justify-content-between" style={{ minHeight: 38 }}>
          <div className="col-auto">
            {isMobile ? (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="left"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  slotProps={{
                    paper: {
                      sx: { width: 240, pt: 2 },
                    },
                  }}
                >
                  <Stack spacing={1.5} sx={{ px: 2 }}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate(-1);
                      }}
                      sx={{
                        minWidth: 0,
                        color: "#1976d2",
                        fontWeight: 500,
                        justifyContent: "flex-start",
                        textTransform: "none",
                        mb: 1, // gap below back button
                      }}
                      fullWidth
                    >
                      Back
                    </Button>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1.2}>
                      {navLinks.map((link) => (
                        <Button
                          key={link.to}
                          variant="text"
                          size="small"
                          startIcon={link.icon}
                          onClick={() => {
                            setDrawerOpen(false);
                            navigate(link.to);
                          }}
                          sx={{
                            minWidth: 0,
                            color: isActive(link.to) && link.to !== "/bots" ? "#fff" : "#1976d2",
                            background: isActive(link.to) && link.to !== "/bots" ? "#1976d2" : "transparent",
                            fontWeight: 500,
                            textTransform: "none",
                            borderRadius: 2,
                            px: 2,
                            justifyContent: "flex-start",
                            width: "100%",
                            "&:hover": {
                              background: isActive(link.to) && link.to !== "/bots" ? "#1565c0" : "#f0f4fa",
                              color: isActive(link.to) && link.to !== "/bots" ? "#fff" : "#1976d2",
                            },
                          }}
                          fullWidth
                        >
                          {link.label}
                        </Button>
                      ))}
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    {/* Move action icons into drawer for mobile */}
                    <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1.2, mt: 1 }}>
                      <Tooltip title="Chat information and tips">
                        <IconButton onClick={() => setOpenInfo(true)}>
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Help">
                        <IconButton onClick={() => setOpenHelp(true)}>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Feedback">
                        <IconButton onClick={() => setOpenFeedback(true)}>
                          <FeedbackOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Suggestions">
                        <IconButton onClick={() => setOpenSuggestion(true)}>
                          <LightbulbOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                </Drawer>
              </>
            ) : (
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Button
                  variant="text"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ minWidth: 0, color: "#1976d2", fontWeight: 500, justifyContent: "flex-start" }}
                >
                  Back
                </Button>
                {navLinks.map((link) => (
                  <Button
                    key={link.to}
                    variant="text"
                    size="small"
                    startIcon={link.icon}
                    onClick={() => navigate(link.to)}
                    sx={{
                      minWidth: 0,
                      color: isActive(link.to) && link.to !== "/bots" ? "#fff" : "#1976d2",
                      background: isActive(link.to) && link.to !== "/bots" ? "#1976d2" : "transparent",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2,
                      justifyContent: "flex-start",
                      "&:hover": {
                        background: isActive(link.to) && link.to !== "/bots" ? "#1565c0" : "#f0f4fa",
                        color: isActive(link.to) && link.to !== "/bots" ? "#fff" : "#1976d2",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            )}
          </div>
          <div className="col-auto">
            {botPageLoading ? (
              <Skeleton width={180} height={32} />
            ) : botPageData ? (
              <Typography
                sx={{
                  fontWeight: 500,
                  color: "#333",
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {botPageData?.botListPage?.heading || botPageData?.name}
              </Typography>
            ) : null}
          </div>
          {!isMobile && (
            <div className="col-auto">
              <Box sx={{ ml: 1, display: "flex", gap: 1.2 }}>
                <Tooltip title="Chat information and tips">
                  <IconButton onClick={() => setOpenInfo(true)}>
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton onClick={() => setOpenHelp(true)}>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Feedback">
                  <IconButton onClick={() => setOpenFeedback(true)}>
                    <FeedbackOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Suggestions">
                  <IconButton onClick={() => setOpenSuggestion(true)}>
                    <LightbulbOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </div>
          )}
        </div>
      </div>
      <FeedbackDialog open={openFeedback} onClose={() => setOpenFeedback(false)} />
      <SuggestionDialog open={openSuggestion} onClose={() => setOpenSuggestion(false)} />
      <HelpDialog open={openHelp} onClose={() => setOpenHelp(false)} />
      <InfoDialog open={openInfo} onClose={() => setOpenInfo(false)} />
    </Box>
  );
};

export default ChatTopPannel;
