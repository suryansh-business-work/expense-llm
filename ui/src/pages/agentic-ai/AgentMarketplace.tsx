import React, { useState } from "react";
import { Box, Typography, Paper, Button, Chip, Tooltip, InputBase } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import PaidIcon from "@mui/icons-material/Paid";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RequestAnAgent from "./RequestAnAgent"; // Import the dialog

// Example agents with a "type" property for filtering
const agents = [
  {
    id: 1,
    name: "Content Writer AI",
    description: "Generate high-quality articles and blog posts in seconds.",
    type: "Free",
    featured: true,
  },
  {
    id: 2,
    name: "Customer Support Bot",
    description: "Automate your customer support with a smart AI agent.",
    type: "Paid",
    featured: false,
  },
  {
    id: 3,
    name: "Data Analyzer",
    description: "Analyze and visualize your data with ease.",
    type: "Free",
    featured: false,
  },
];

const FILTERS = [
  { label: "All", value: "All" },
  { label: "Free", value: "Free" },
  { label: "Paid", value: "Paid" },
];

const AgentMarketplace: React.FC = () => {
  const [filter, setFilter] = useState<"All" | "Free" | "Paid">("All");
  const [search, setSearch] = useState("");
  const [openRequest, setOpenRequest] = useState(false);

  const filteredAgents = agents.filter((a) => {
    const matchesType = filter === "All" ? true : a.type === filter;
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Box sx={{ py: 4, px: { xs: 1, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SmartToyIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
        <Typography variant="h5" fontWeight={700}>
          Agents Marketplace
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover, explore, and deploy AI agents to supercharge your workflow.
        <br />
        <span style={{ color: "#1976d2", fontWeight: 500 }}>
          Browse our curated marketplace and find the perfect agent for your
          needs.
        </span>
      </Typography>

      {/* Search, Filter, and Request Button Row using Bootstrap grid */}
      <div className="row mb-4">
        <div className="col-12 col-md-8 d-flex align-items-center">
          {/* Search */}
          <Paper
            component="form"
            sx={{
              p: "2px 8px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              borderRadius: 2,
              boxShadow: 0,
              border: "1px solid #e3eafc",
              bgcolor: "#fff",
              minHeight: 44,
              mr: 2,
            }}
            onSubmit={e => e.preventDefault()}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: 16 }}
              placeholder="Search agents…"
              inputProps={{ "aria-label": "search agents" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <SearchIcon color="primary" />
          </Paper>
          {/* Filters */}
          <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "contained" : "outlined"}
                color="primary"
                onClick={() => setFilter(f.value as "All" | "Free" | "Paid")}
                sx={{
                  borderRadius: 2,
                  minWidth: 80,
                  fontWeight: 600,
                  boxShadow: filter === f.value ? 2 : 0,
                  bgcolor: filter === f.value ? "#e3eafc" : undefined,
                  color: filter === f.value ? "#1976d2" : undefined,
                  transition: "all 0.2s",
                  fontSize: 14,
                  px: 2,
                }}
                startIcon={
                  f.value === "Free" ? (
                    <StarIcon />
                  ) : f.value === "Paid" ? (
                    <PaidIcon />
                  ) : undefined
                }
              >
                {f.label}
              </Button>
            ))}
          </Box>
        </div>
        <div className="col-12 col-md-4 d-flex justify-content-md-end justify-content-center align-items-center mt-2 mt-md-0">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 2,
              bgcolor: "#1976d2",
              color: "#fff",
              "&:hover": { bgcolor: "#125ea2" },
              width: "100%",
              minWidth: 160,
              maxWidth: 220,
            }}
            onClick={() => setOpenRequest(true)}
          >
            Request an Agent
          </Button>
        </div>
      </div>

      {/* Agent Cards using Bootstrap grid */}
      <div className="row">
        {filteredAgents.map((agent) => (
          <div className="col-12 col-md-6 col-lg-4 mb-4" key={agent.id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                bgcolor: "#f7f8fa",
                border: agent.featured ? "2px solid #1976d2" : "1px solid #e3eafc",
                position: "relative",
                transition: "box-shadow 0.2s, border 0.2s",
                "&:hover": {
                  boxShadow: 6,
                  borderColor: "#1976d2",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                  {agent.name}
                </Typography>
                {agent.featured && (
                  <Chip
                    icon={<WorkspacePremiumIcon sx={{ color: "#FFD700" }} />}
                    label="Featured"
                    size="small"
                    sx={{
                      bgcolor: "#fffbe6",
                      color: "#bfa100",
                      fontWeight: 700,
                      ml: 1,
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {agent.description}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
                <Chip
                  label={agent.type}
                  color={agent.type === "Free" ? "success" : "warning"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    mr: 1,
                    bgcolor:
                      agent.type === "Free" ? "#e8f5e9" : "#fffde7",
                    color: agent.type === "Free" ? "#388e3c" : "#bfa100",
                  }}
                  icon={agent.type === "Free" ? <StarIcon /> : <PaidIcon />}
                />
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                  sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </div>
        ))}
        {filteredAgents.length === 0 && (
          <div className="col-12">
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              No agents found for this filter.
            </Typography>
          </div>
        )}
      </div>
      {/* Request An Agent Dialog */}
      <RequestAnAgent open={openRequest} onClose={() => setOpenRequest(false)} />
    </Box>
  );
};

export default AgentMarketplace;