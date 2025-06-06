import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Badge,
  Rating,
  Menu,
  MenuItem,
  Skeleton,
  Divider,
  Button,
  Tooltip,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StarIcon from "@mui/icons-material/Star";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import BuildIcon from "@mui/icons-material/Build";
import VerifiedIcon from "@mui/icons-material/Verified";
import LaunchIcon from "@mui/icons-material/Launch";
import StorageIcon from "@mui/icons-material/Storage"; // Added missing import
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../providers/UserProvider";
import { useMcpServers } from "./context/McpServerContext";

const McpServersMarketplace: React.FC = () => {
  const { servers, loading } = useMcpServers();
  const { user } = useUserContext();
  const navigate = useNavigate();

  // State management
  const [marketSearch, setMarketSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Featured servers (top 3 by rating)
  const featuredServers = [...servers]
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 3);

  // Filter servers by search and sort them
  const filteredServers = servers
    .filter(
      (server) =>
        marketSearch === "" ||
        server.mcpServerName?.toLowerCase().includes(marketSearch.toLowerCase()) ||
        server.description?.toLowerCase().includes(marketSearch.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.avgRating || 0) - (a.avgRating || 0);
        case "reviews":
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        case "tools":
          return (b.toolCount || 0) - (a.toolCount || 0);
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        default:
          return (b.avgRating || 0) - (a.avgRating || 0);
      }
    });

  // Sort menu handlers
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

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true, // Enable arrows for better navigation
    adaptiveHeight: true, // Better height management
    centerMode: false, // This can cause layout issues sometimes
    dotsClass: "slick-dots",
    pauseOnHover: true,
    fade: true,
    cssEase: "ease-out",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      {/* Stats and Search Bar */}
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
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            MCP Servers Marketplace
          </Typography>
          <Box display="flex" gap={2}>
            <Chip
              icon={<StorageIcon sx={{ fontSize: 16 }} />}
              label={`${servers.length} Servers Available`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<BuildIcon sx={{ fontSize: 16 }} />}
              label={`${servers.reduce(
                (sum, s) => sum + (s.toolCount || 0),
                0
              )} Tools`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", md: "auto" },
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search marketplace..."
            variant="outlined"
            size="small"
            value={marketSearch}
            onChange={(e) => setMarketSearch(e.target.value)}
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
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Sort Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSortClose}>
        <MenuItem onClick={() => handleSortSelect("rating")}>
          <Typography sx={{ fontWeight: sortBy === "rating" ? 700 : 400 }}>
            Highest Rating
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("reviews")}>
          <Typography sx={{ fontWeight: sortBy === "reviews" ? 700 : 400 }}>
            Most Reviews
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("tools")}>
          <Typography sx={{ fontWeight: sortBy === "tools" ? 700 : 400 }}>
            Most Tools
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSortSelect("newest")}>
          <Typography sx={{ fontWeight: sortBy === "newest" ? 700 : 400 }}>
            Newest First
          </Typography>
        </MenuItem>
      </Menu>

      {/* Featured Servers Carousel */}
      {loading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={300}
          sx={{ borderRadius: 3, mb: 4 }}
        />
      ) : featuredServers.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            mb: 4,
            borderRadius: 3,
            ".slick-slider": {
              overflow: "hidden",
              borderRadius: 3,
            },
            ".slick-list": {
              overflow: "visible",
            },
            ".slick-slide": {
              padding: "0 8px",
            },
            ".slick-dots": {
              bottom: 10,
              "& li button:before": {
                color: "#fff",
                opacity: 0.7,
                fontSize: 8,
              },
              "& li.slick-active button:before": {
                opacity: 1,
                color: "#fff",
              },
            },
            ".slick-prev, .slick-next": {
              zIndex: 1,
              width: "30px",
              height: "30px",
              "&:before": {
                fontSize: "30px",
              },
            },
            ".slick-prev": { left: 10 },
            ".slick-next": { right: 10 },
          }}
        >
          <div style={{ margin: "0 -8px" }}>
            <Slider {...sliderSettings}>
              {featuredServers.map((server, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: "100%",
                    height: { xs: 220, md: 340 },
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    background: `linear-gradient(rgba(25, 118, 210, 0.6), rgba(25, 118, 210, 0.3)), 
                              url(https://source.unsplash.com/random/1200x600?tech&sig=${server._id}) center center / cover no-repeat`,
                  }}
                >
                  <Box
                    sx={{
                      background: "rgba(255,255,255,0.85)",
                      color: "#333",
                      p: { xs: 2, md: 4 },
                      borderRadius: 3,
                      maxWidth: 480,
                      ml: { xs: 2, md: 8 },
                      boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}
                    >
                      {server.mcpServerName || "Untitled Server"}
                      {server.verified && (
                        <VerifiedIcon
                          sx={{ ml: 1, fontSize: 20, color: "#1976d2" }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {server.description ||
                        "A powerful MCP server for your bots and tools."}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={2}
                      sx={{ mb: 2 }}
                    >
                      <Box display="flex" alignItems="center">
                        <Rating
                          value={server.avgRating || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                          emptyIcon={
                            <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                          }
                        />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                          ({server.avgRating?.toFixed(1) || "N/A"})
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ChatBubbleOutlineIcon sx={{ color: "#1976d2", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {server.totalReviews || 0} reviews
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <BuildIcon sx={{ color: "#1976d2", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {server.toolCount || 0} tools
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ color: "#1976d2", fontWeight: 500 }}
                    >
                      {server.mcpServerCreatorId === user?.userId
                        ? "Launched by You"
                        : `Launched by ${server.mcpServerCreatorId || "Unknown"}`}
                    </Typography>

                    <Button
                      variant="contained"
                      endIcon={<LaunchIcon />}
                      sx={{ mt: 2, borderRadius: 8, px: 3 }}
                      onClick={() => navigate(`/lab/mcp-server/${server.mcpServerId}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              ))}
            </Slider>
          </div>
        </Box>
      ) : null}

      {/* Marketplace Section Header */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Divider sx={{ mb: 2 }}>
          <Chip
            label={marketSearch ? `${filteredServers.length} Results` : "All Servers"}
            color="primary"
          />
        </Divider>
      </Box>

      {/* Server Cards Grid */}
      <div className="row">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, idx) => (
            <div className="col-12 col-sm-6 col-md-4 mb-4" key={idx}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={280}
                sx={{ borderRadius: 3 }}
              />
            </div>
          ))
        ) : filteredServers.length === 0 ? (
          <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No servers found matching your search criteria
            </Typography>
            {marketSearch && (
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setMarketSearch("")}
              >
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          filteredServers.map((server, idx) => (
            <div className="col-12 col-sm-6 col-md-4 mb-4" key={server.mcpServerId || idx}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                custom={idx}
                whileHover={{
                  translateY: -8,
                  transition: { duration: 0.2 },
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => navigate(`/lab/mcp-server/${server.mcpServerId}`)}
                >
                  {/* Card Header/Image */}
                  <Box
                    sx={{
                      height: 140,
                      width: "100%",
                      position: "relative",
                      background: `linear-gradient(rgba(25, 118, 210, 0.6), rgba(25, 118, 210, 0.2)), 
                                  url(https://source.unsplash.com/random/600x400?tech&sig=${server._id}) center center / cover no-repeat`,
                    }}
                  >
                    {server.verified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Verified"
                        color="primary"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: "rgba(255,255,255,0.9)",
                        }}
                      />
                    )}
                  </Box>

                  {/* Card Content */}
                  <CardContent
                    sx={{
                      p: 2,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {server.mcpServerName || "Untitled Server"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5, flexGrow: 1 }}
                    >
                      {server.description ||
                        "This MCP server provides computing resources for various bot operations."}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Rating
                          value={server.avgRating || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: "#666" }}>
                          ({server.avgRating?.toFixed(1) || "N/A"}) •{" "}
                          {server.totalReviews || 0} reviews
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Badge
                            badgeContent={server.toolCount || 0}
                            color="primary"
                            max={99}
                          >
                            <BuildIcon color="action" fontSize="small" />
                          </Badge>
                          <Typography variant="body2" sx={{ ml: 1, color: "#555" }}>
                            tool{(server.toolCount || 0) !== 1 ? "s" : ""}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{ ml: 1, color: "#1976d2", fontWeight: 500 }}
                          >
                            {server.mcpServerCreatorId === user?.userId
                              ? "Your Server"
                              : `${server.mcpServerCreatorId?.substring(0, 6) || "Unknown"}...`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default McpServersMarketplace;