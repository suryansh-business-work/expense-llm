import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import SettingsIcon from "@mui/icons-material/Settings";

// Import components
import CodeSection from './components/CodeSection';
import ToolSettingsSection from './components/ToolSettingsSection';
import ToolDetailsSection from './components/ToolDetailsSection';
import TerminalSection from "./components/TerminalSection";

const ToolLaboratoryContainer: React.FC = () => {
  const { mcpServerId, toolId } = useParams<{ mcpServerId: string; toolId: string }>();
  const [activeTab, setActiveTab] = useState(0);

  if (!mcpServerId || !toolId) {
    return <Box p={3}>Missing required parameters</Box>;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Tool Details Section */}
      <ToolDetailsSection mcpServerId={mcpServerId} />

      {/* Main content area with tabs */}
      <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 16,
                minHeight: 48
              }
            }}
          >
            <Tab
              label="Code"
              icon={<CodeIcon />}
              iconPosition="start"
            />
            <Tab
              label="Tool Settings"
              icon={<SettingsIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Code Tab */}
        {activeTab === 0 && (
          <CodeSection />
        )}

        {/* Tool Settings Tab */}
        {activeTab === 1 && (
          <ToolSettingsSection />
        )}
      </>
      <TerminalSection />
    </Box>
  );
};

export default ToolLaboratoryContainer;
