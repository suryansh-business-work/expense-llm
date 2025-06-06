import { useState, useRef } from "react";
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
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const dummyServer = {
  id: "1",
  name: "Botifylife Finance MCP",
  description: "A managed compute provider for finance bots. Fast, secure, and scalable.",
  images: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
  ],
  rating: 4.8,
  comments: 23,
  tags: ["Finance", "Secure", "Fast"],
  launchedBy: "Botifylife",
  privacy: "Your data is encrypted and never shared.",
  pricing: "Free tier available. Pro: $19/mo.",
  support: "Email and chat support available 24/7.",
  related: [
    { name: "Botifylife AI MCP", id: "2" },
    { name: "Botifylife Data MCP", id: "3" },
  ],
};

const dummyComments = [
  {
    user: "Alice",
    avatar: "",
    rating: 5,
    comment: "Great MCP server for my finance bots!",
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
  "Details",
  "Privacy",
  "Pricing",
  "Support",
  "Related",
];

const McpServerDetails = () => {
  const [tab, setTab] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const sliderRef = useRef<any>(null);

  // In real app, fetch server details by id

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleCommentSubmit = () => {
    // In real app, post comment
    setComment("");
    alert("Comment submitted!");
  };

  return (
    <Box sx={{ background: "#f6f8fa", minHeight: "100vh", py: { xs: 1, md: 3 } }}>
      <Box
        sx={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 4,
          boxShadow: "0 4px 32px rgba(25,118,210,0.08)",
          px: { xs: 1, sm: 2, md: 4 },
          py: { xs: 1.5, md: 3 },
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Back and Share */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              background: "#e3eafc",
              color: "#1976d2",
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": { background: "#d2e3fc" },
              minWidth: 90,
              fontSize: 15,
            }}
            variant="contained"
            aria-label="Back"
          >
            Back
          </Button>
          <Tooltip title="Share MCP Server">
            <IconButton onClick={handleShare} sx={{ color: "#1976d2" }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Image Slider */}
        <Box
          sx={{
            width: "100%",
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(25,118,210,0.08)",
            position: "relative",
          }}
        >
          {/* Left Arrow */}
          <IconButton
            onClick={() => sliderRef.current?.slickPrev()}
            sx={{
              position: "absolute",
              top: "50%",
              left: 12,
              zIndex: 2,
              transform: "translateY(-50%)",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
              "&:hover": { background: "#e3eafc" },
              width: 40,
              height: 40,
              display: { xs: "none", sm: "flex" },
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
              right: 12,
              zIndex: 2,
              transform: "translateY(-50%)",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
              "&:hover": { background: "#e3eafc" },
              width: 40,
              height: 40,
              display: { xs: "none", sm: "flex" },
            }}
            aria-label="Next image"
          >
            <ChevronRightIcon sx={{ fontSize: 28, color: "#1976d2" }} />
          </IconButton>
          <Slider
            ref={sliderRef}
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            arrows={false}
            adaptiveHeight={false}
            centerMode={true}
            centerPadding="0px"
            dotsClass="slick-dots slick-thumb"
          >
            {dummyServer.images.map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  width: "100%",
                  height: { xs: 180, sm: 240, md: 340 },
                  background: `url(${img}) center center / cover no-repeat`,
                  borderRadius: 3,
                  position: "relative",
                  transition: "box-shadow 0.2s",
                }}
              />
            ))}
          </Slider>
        </Box>

        {/* Title, tags, launch info */}
        <Box
          display="flex"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          mb={1}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, flexShrink: 0 }}>
            {dummyServer.name}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {dummyServer.tags.map((tag, i) => (
              <Chip key={i} label={tag} color="primary" size="small" sx={{ fontWeight: 500 }} />
            ))}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "#888",
              ml: { xs: 0, sm: 2 },
              mt: { xs: 0.5, sm: 0 },
              fontSize: 15,
            }}
          >
            Launched by <b>{dummyServer.launchedBy}</b>
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={3} mb={2} mt={0.5}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <StarIcon sx={{ color: "#FFD600", fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {dummyServer.rating}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <ChatBubbleOutlineIcon sx={{ color: "#1976d2", fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {dummyServer.comments}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 32,
            mb: 2,
            background: "#f3f6fb",
            borderRadius: 2,
            px: 1,
            "& .MuiTab-root": {
              minHeight: 32,
              px: 2,
              py: 0.5,
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              textTransform: "none",
            },
            "& .Mui-selected": {
              background: "#e3eafc",
              color: "#1976d2",
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
        <Divider sx={{ mb: 2 }} />

        {/* Tab Panels */}
        {tab === 0 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: "#444", fontSize: 17 }}>
              {dummyServer.description}
            </Typography>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              User Ratings & Comments
            </Typography>
            <Box mb={2}>
              <Rating
                value={userRating}
                onChange={(_, v) => setUserRating(v)}
                precision={0.5}
                size="large"
              />
              <TextField
                label="Add a comment"
                multiline
                minRows={2}
                fullWidth
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={{ mt: 1 }}
              />
              <Button
                variant="contained"
                sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
                disabled={!userRating || !comment}
                onClick={handleCommentSubmit}
              >
                Submit
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {dummyComments.map((c, i) => (
              <Paper
                key={i}
                sx={{
                  p: 2,
                  mb: 2,
                  background: theme.palette.mode === "dark" ? "#23272f" : "#f9fafb",
                  borderRadius: 2,
                  boxShadow: "0 1px 8px rgba(25,118,210,0.06)",
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: "#e3eafc", color: "#1976d2", fontWeight: 700 }}>
                    {c.user[0]}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600 }}>{c.user}</Typography>
                  <Rating value={c.rating} readOnly size="small" />
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {c.date}
                  </Typography>
                </Box>
                <Typography sx={{ color: "#444" }}>{c.comment}</Typography>
              </Paper>
            ))}
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Typography variant="body1" sx={{ color: "#444" }}>
              <b>Details:</b> {dummyServer.description}
            </Typography>
          </Box>
        )}
        {tab === 3 && (
          <Box>
            <Typography variant="body1" sx={{ color: "#444" }}>
              <b>Privacy:</b> {dummyServer.privacy}
            </Typography>
          </Box>
        )}
        {tab === 4 && (
          <Box>
            <Typography variant="body1" sx={{ color: "#444" }}>
              <b>Pricing:</b> {dummyServer.pricing}
            </Typography>
          </Box>
        )}
        {tab === 5 && (
          <Box>
            <Typography variant="body1" sx={{ color: "#444" }}>
              <b>Support:</b> {dummyServer.support}
            </Typography>
          </Box>
        )}
        {tab === 6 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Related MCP Servers
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {dummyServer.related.map((rel, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 2,
                    py: 0.5,
                    fontSize: 15,
                  }}
                  onClick={() => navigate(`/mcp-servers/${rel.id}`)}
                >
                  {rel.name}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default McpServerDetails;