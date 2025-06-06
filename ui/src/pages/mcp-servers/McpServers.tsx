import { useState } from "react";
import { Box, Tabs, Tab, Divider } from "@mui/material";
import { McpServerProvider } from "./context/McpServerContext";
import YourMcpServer from "./YourMcpServer";
import McpServersMarketplace from "./McpServersMarketplace";
import DynamicBreadcrumb from "../../components/DynamicBreadcrumb";

const McpServers = () => {
  const [tab, setTab] = useState(0);

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'MCP Servers Marketplace' }
  ];

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
          {/* Back Button and Breadcrumbs */}
          <DynamicBreadcrumb
            items={breadcrumbItems}
            backPath="/bots"
            showBack={true}
            backLabel="Back"
          />

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 32,
              background: "#f3f6fb",
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
