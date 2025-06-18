import React, { useState } from "react";
import { Box, Tabs, Tab, Divider, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AgentMarketplace from "./AgentMarketplace";
import YourAgents from "./YourAgents";

const AgenticAi: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ background: "#f6f8fa", minHeight: "100vh" }}>
      <Box
        sx={{
          maxWidth: 1300,
          margin: "0 auto",
          borderRadius: 3,
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 32,
            background: "#f3f6fb",
            borderRadius: 2,
            padding: "4px",
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
          TabIndicatorProps={{ style: { display: "none" } }}
          variant="fullWidth"
        >
          <Tab label="Agents Marketplace" />
          <Tab label="Your Agents" />
        </Tabs>
        <Divider sx={{ mb: 1, mt: 1 }} />
        {tab === 0 && (
          <AgentMarketplace />
        )}
        {tab === 1 && (
          <YourAgents />
        )}
      </Box>
    </Box>
  );
};

export default AgenticAi;
