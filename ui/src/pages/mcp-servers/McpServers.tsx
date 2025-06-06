import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Divider } from "@mui/material";
import { McpServerProvider } from "./context/McpServerContext";
import YourMcpServer from "./YourMcpServer";
import McpServersMarketplace from "./McpServersMarketplace";
import { useNavigate, useLocation } from "react-router-dom";

const McpServers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);

  // Set initial tab based on URL path
  useEffect(() => {
    if (location.pathname.includes('/lab/mcp-servers/your-servers')) {
      setTab(1);
    } else {
      setTab(0);
    }
  }, [location.pathname]);

  // Handle tab change and update URL
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    
    // Update URL based on selected tab
    if (newValue === 0) {
      navigate('/lab/mcp-servers/marketplace');
    } else {
      navigate('/lab/mcp-servers/your-servers');
    }
  };

  return (
    <McpServerProvider>
      <Box sx={{ background: "#f6f8fa", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: 1320,
            margin: "0 auto",
            borderRadius: 3,
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
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
          >
            <Tab label="MCP Servers Marketplace" />
            <Tab label="Your MCP Servers" />
          </Tabs>

          <Divider sx={{ mb: 3 }} />
          {tab === 0 && <McpServersMarketplace />}
          {tab === 1 && <YourMcpServer />}
        </Box>
      </Box>
    </McpServerProvider>
  );
};

export default McpServers;
