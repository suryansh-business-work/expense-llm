import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Rating,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BuildIcon from "@mui/icons-material/Build";
import StorageIcon from "@mui/icons-material/Storage";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Simple dummy images for the slider
const dummyImages = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
];

// Dummy data for missing fields in API response
const dummyData = {
  description: "This MCP server provides efficient compute resources for your automation needs.",
  rating: 4.7,
  comments: 15,
  tags: ["Automation", "Cloud", "Scalable"],
  toolCount: 12,
};

const dummyComments = [
  {
    user: "Alice",
    avatar: "",
    rating: 5,
    comment: "Great MCP server for my automation bots!",
    date: "2025-06-01",
  },
  {
    user: "Bob",
    avatar: "",
    rating: 4,
    comment: "Fast and reliable, but could use more integrations.",
    date: "2025-06-03",
  },
];

const tabLabels = [
  "Overview",
  "Rating",
  "Tools",
  "Configuration",
  "Usage",
];

const McpServerDetailsPage = () => {
  // Component state
  const [tab, setTab] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  const sliderRef = useRef<any>(null);
  const { mcpServerId } = useParams<{ mcpServerId: string }>();
  
  // Server data state
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch server details from API
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

  // Load server details on component mount or when ID changes
  useEffect(() => {
    getServerDetails();
  }, [getServerDetails, mcpServerId]);

  // Handle share functionality
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    setComment("");
    alert("Comment submitted!");
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Simplified slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    adaptiveHeight: false,
    fade: true,
    cssEase: 'ease-out',
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6">
          Loading MCP Server details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#f6f8fa", minHeight: "100vh", py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(25,118,210,0.08)",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 3 },
          transition: "all 0.3s ease",
        }}
      >
        {/* Back and Share */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              background: "#e3eafc",
              color: "#1976d2",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": { background: "#d2e3fc", transform: "translateY(-2px)" },
              minWidth: 90,
              fontSize: 15,
              transition: "transform 0.2s ease",
            }}
            variant="contained"
            aria-label="Back"
          >
            Back
          </Button>
          <Tooltip title="Share MCP Server">
            <IconButton 
              onClick={handleShare} 
              sx={{ 
                color: "#1976d2",
                "&:hover": { 
                  background: "#e3eafc",
                  transform: "rotate(10deg)" 
                },
                transition: "all 0.2s ease"
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Error message if API call failed */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Image Slider - Using dummy images as requested */}
        <Box
          sx={{
            width: "100%",
            mb: 4,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(25,118,210,0.12)",
            position: "relative",
          }}
        >
          {/* Left Arrow */}
          <IconButton
            onClick={() => sliderRef.current?.slickPrev()}
            sx={{
              position: "absolute",
              top: "50%",
              left: 16,
              zIndex: 2,
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { background: "#fff", transform: "translateY(-50%) scale(1.1)" },
              width: 44,
              height: 44,
              display: { xs: "none", sm: "flex" },
              transition: "transform 0.2s ease",
            }}
            aria-label="Previous image"
          >
            <ChevronLeftIcon sx={{ fontSize: 28, color: "#1976d2" }} />
          </IconButton>
          
          {/* Right Arrow */}
          <IconButton
            onClick={() => sliderRef.current?.slickNext()}
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              zIndex: 2,
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { background: "#fff", transform: "translateY(-50%) scale(1.1)" },
              width: 44,
              height: 44,
              display: { xs: "none", sm: "flex" },
              transition: "transform 0.2s ease",
            }}
            aria-label="Next image"
          >
            <ChevronRightIcon sx={{ fontSize: 28, color: "#1976d2" }} />
          </IconButton>
          
          <Slider
            ref={sliderRef}
            {...sliderSettings}
          >
            {/* Simple dummy images as requested */}
            {dummyImages.map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  width: "100%",
                  height: { xs: 200, sm: 300, md: 380 },
                  background: `linear-gradient(rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1)), 
                              url(${img}) center center / cover no-repeat`,
                  position: "relative",
                }}
              />
            ))}
          </Slider>
        </Box>

        {/* Server Details Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            display="flex"
            alignItems={{ xs: "flex-start", sm: "center" }}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
            mb={2}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, flexShrink: 0, color: "#1976d2" }}>
              {server?.mcpServerName || "Unknown Server"}
            </Typography>
            
            <Box display="flex" gap={1} flexWrap="wrap">
              {dummyData.tags.map((tag, i) => (
                <Chip 
                  key={i} 
                  label={tag} 
                  color="primary" 
                  size="small" 
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: "#e3eafc",
                    color: "#1976d2",
                    borderRadius: 4,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#d2e3fc",
                      transform: "translateY(-2px)"
                    }
                  }} 
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 3, md: 4 }, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <StorageIcon sx={{ color: "#1976d2" }} />
              <Typography variant="body1" sx={{ color: "#666" }}>
                ID: <Box component="span" sx={{ color: "#333", fontWeight: 500 }}>{server?.mcpServerId}</Box>
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <BuildIcon sx={{ color: "#1976d2" }} />
              <Typography variant="body1" sx={{ color: "#666" }}>
                Tools: <Box component="span" sx={{ color: "#333", fontWeight: 500 }}>{dummyData.toolCount}</Box>
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <StarIcon sx={{ color: "#FFD600" }} />
              <Typography variant="body1" sx={{ color: "#666" }}>
                Rating: <Box component="span" sx={{ color: "#333", fontWeight: 500 }}>{dummyData.rating}</Box>
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <ChatBubbleOutlineIcon sx={{ color: "#1976d2" }} />
              <Typography variant="body1" sx={{ color: "#666" }}>
                Reviews: <Box component="span" sx={{ color: "#333", fontWeight: 500 }}>{dummyData.comments}</Box>
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Created: <Box component="span" sx={{ color: "#333", fontWeight: 500 }}>
                {formatDate(server?.createdAt)}
              </Box>
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ fontSize: 16, color: "#444" }}>
            Launched by <Box component="span" sx={{ color: "#1976d2", fontWeight: 600 }}>
              {server?.mcpServerCreatorId}
            </Box>
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 40,
            mb: 3,
            background: "#f3f6fb",
            borderRadius: 2,
            px: 1,
            "& .MuiTab-root": {
              minHeight: 40,
              px: 2,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              textTransform: "none",
              transition: "all 0.2s ease",
            },
            "& .Mui-selected": {
              background: "#e3eafc",
              color: "#1976d2",
              boxShadow: "0 2px 8px rgba(25,118,210,0.1)",
            },
          }}
          TabIndicatorProps={{
            style: { display: "none" }
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map(label => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        <Divider sx={{ mb: 3 }} />

        {/* Tab Panels */}
        {tab === 0 && (
          <Box sx={{ p: { xs: 0, md: 1 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Overview
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "#444", fontSize: 17, lineHeight: 1.6 }}>
              {dummyData.description}
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#f9fafb", mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Server Specifications
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                    Memory
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    8 GB RAM
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                    CPU
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    4 vCPUs
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                    Storage
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    100 GB SSD
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                    Network
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    5 Gbps
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Button
              variant="contained"
              size="large"
              sx={{ 
                mt: 2, 
                mb: 4, 
                borderRadius: 2,
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(25,118,210,0.2)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(25,118,210,0.3)",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.2s ease"
              }}
            >
              Deploy Bot to This Server
            </Button>
          </Box>
        )}
        
        {tab === 1 && (
          <Box sx={{ p: { xs: 0, md: 1 } }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              User Ratings & Reviews
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#f9fafb", mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Write a Review
              </Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Your Rating:
                </Typography>
                <Rating
                  value={userRating}
                  onChange={(_, v) => setUserRating(v)}
                  precision={0.5}
                  size="large"
                />
              </Box>
              
              <TextField
                label="Your Review"
                placeholder="Share your experience with this MCP server..."
                multiline
                minRows={3}
                fullWidth
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                sx={{ 
                  borderRadius: 2, 
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)"
                  }
                }}
                disabled={!userRating || !comment}
                onClick={handleCommentSubmit}
              >
                Submit Review
              </Button>
            </Paper>
            
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Reviews
            </Typography>
            
            {dummyComments.map((c, i) => (
              <Paper
                key={i}
                sx={{
                  p: 3,
                  mb: 3,
                  background: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "#e3eafc", color: "#1976d2", fontWeight: 700 }}>
                    {c.user[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{c.user}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating value={c.rating} readOnly size="small" />
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {c.date}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography sx={{ color: "#444", lineHeight: 1.6 }}>{c.comment}</Typography>
              </Paper>
            ))}
          </Box>
        )}
        
        {/* Add content for tabs 2, 3, and 4 as needed */}
      </Box>
    </Box>
  );
};

export default McpServerDetailsPage;
