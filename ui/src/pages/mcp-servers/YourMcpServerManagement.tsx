import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Import components
import McpServerDetails from "./McpServerDetails";
import Tools from "./tool-management/Tools";

const YourMcpServerManagement = () => {
  const { mcpServerId } = useParams<{ mcpServerId: string }>();
  const navigate = useNavigate();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            background: "#e3eafc",
            color: "#1976d2",
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            py: 1,
            mr: 2,
            boxShadow: "none",
            "&:hover": { background: "#d2e3fc" },
          }}
          variant="contained"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h6" color="text.secondary" fontWeight={500}>
          Server Management
        </Typography>
      </Box>
      
      {/* Server details */}
      <McpServerDetails />
      
      {/* Tabs for different sections */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            minHeight: 48,
            fontWeight: 600,
            textTransform: "none",
            fontSize: 16,
          }
        }}
      >
        <Tab label="Tools" />
        <Tab label="Settings" />
        <Tab label="Logs" />
        <Tab label="API Keys" />
      </Tabs>
      
      {/* Tab Content */}
      {activeTab === 0 && (
        <Tools mcpServerId={mcpServerId || ""} />
      )}
      {activeTab === 1 && (
        <Typography variant="body1" color="text.secondary" p={4} textAlign="center">
          Settings tab content will be available soon.
        </Typography>
      )}
      {activeTab === 2 && (
        <Typography variant="body1" color="text.secondary" p={4} textAlign="center">
          Logs tab content will be available soon.
        </Typography>
      )}
      {activeTab === 3 && (
        <Typography variant="body1" color="text.secondary" p={4} textAlign="center">
          API Keys tab content will be available soon.
        </Typography>
      )}
    </Box>
  );
};

export default YourMcpServerManagement;