import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  TextField,
} from "@mui/material";
import Slider from "react-slick";
import InputAdornment from "@mui/material/InputAdornment";
import StarIcon from "@mui/icons-material/Star";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TuneIcon from "@mui/icons-material/Tune";
import { useNavigate } from "react-router-dom";

// Moved the predefined servers data directly into component
const predefinedServers = [
  {
    name: "Botifylife Finance MCP",
    description: "A managed compute provider for finance bots. Fast, secure, and scalable.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    comments: 23,
    launchedBy: "Botifylife",
  },
  {
    name: "Botifylife AI MCP",
    description: "Optimized for AI workloads and LLM bots. Includes GPU support.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    comments: 31,
    launchedBy: "Botifylife",
  },
  {
    name: "Botifylife Data MCP",
    description: "Best for bots that need high-throughput data pipelines.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    comments: 15,
    launchedBy: "Botifylife",
  },
];

const McpServersMarketplace: React.FC = () => {
  // Moved state management inside component
  const [marketSearch, setMarketSearch] = useState("");
  const navigate = useNavigate();

  const filteredPredefinedServers = predefinedServers.filter(server =>
    server.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
    server.description.toLowerCase().includes(marketSearch.toLowerCase())
  );

  return (
    <>
      {/* MCP Marketplace Image Slider */}
      <Box sx={{ width: "100%", mb: 3 }}>
        <Slider
          dots={true}
          infinite={true}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
          autoplay={true}
          autoplaySpeed={4000}
          arrows={false}
          adaptiveHeight={false}
          centerMode={true}
          centerPadding="0px"
          dotsClass="slick-dots slick-thumb"
        >
          {predefinedServers.map((server, idx) => (
            <Box
              key={idx}
              sx={{
                width: "100%",
                height: { xs: 180, md: 320 },
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                background: `url(${server.image}) center center / cover no-repeat`,
              }}
            >
              <Box
                sx={{
                  background: "rgba(0,0,0,0.45)",
                  color: "#fff",
                  p: { xs: 2, md: 4 },
                  borderRadius: 3,
                  maxWidth: 480,
                  ml: { xs: 2, md: 8 },
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {server.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {server.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <StarIcon sx={{ color: "#FFD600", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {server.rating}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ChatBubbleOutlineIcon sx={{ color: "#fff", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {server.comments}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#fff", opacity: 0.85 }}>
                    <b>Launched by:</b> {server.launchedBy}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>
      {/* Marketplace Filters */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          px: 2,
          py: 1.5,
          background: "#f9fafb",
          borderRadius: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search MCP Marketplace..."
          value={marketSearch}
          onChange={e => setMarketSearch(e.target.value)}
          sx={{ minWidth: 220, background: "#fff", borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TuneIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      {/* Marketplace Cards */}
      <div className="row">
        {filteredPredefinedServers.length === 0 ? (
          <Typography sx={{ m: 3, color: "#888" }}>
            No MCP servers found in marketplace.
          </Typography>
        ) : (
          filteredPredefinedServers.map((server, idx) => (
            <div className="col-12 col-sm-6 col-md-4 mb-4" key={idx}>
              <Card
                sx={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(25,118,210,0.06)",
                  maxWidth: "900px",
                  minHeight: 260,
                  p: 0,
                  border: "1px solid #e3eafc",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: "0 8px 32px rgba(25,118,210,0.13)",
                    transform: "translateY(-2px) scale(1.01)",
                  },
                }}
                onClick={() => navigate(`/lab/mcp-server/${idx + 1}`)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${server.name}`}
              >
                {/* Card Image */}
                <Box
                  sx={{
                    width: "100%",
                    height: 140,
                    background: `url(${server.image}) center center / cover no-repeat`,
                  }}
                />
                <CardContent sx={{ flex: 1, p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {server.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 15, mb: 1 }}>
                    {server.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 500, mb: 1 }}>
                    Launched by: {server.launchedBy}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ color: "#FFD600", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {server.rating}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ChatBubbleOutlineIcon sx={{ color: "#1976d2", fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {server.comments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default McpServersMarketplace;