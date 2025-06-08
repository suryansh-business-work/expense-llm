import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import SettingsIcon from "@mui/icons-material/Settings";

// Import components
import ToolProvider, { useToolContext } from './context/ToolContext';
import CodeSection from './components/CodeSection';
import ToolSettingsSection from './components/ToolSettingsSection';
import TerminalSection from './components/TerminalSection';
import LoaderSection from './components/LoaderSection';
import ToolDetailsSection from './components/ToolDetailsSection';

// Main container component
const ToolLaboratoryContainer: React.FC = () => {
  const { mcpServerId, toolId } = useParams<{ mcpServerId: string; toolId: string }>();
  
  if (!mcpServerId || !toolId) {
    return <Box p={3}>Missing required parameters</Box>;
  }

  return (
    <ToolProvider mcpServerId={mcpServerId} toolId={toolId}>
      <ToolLaboratoryContent mcpServerId={mcpServerId} />
    </ToolProvider>
  );
};

// Content component that uses the context
const ToolLaboratoryContent: React.FC<{ mcpServerId: string }> = ({ mcpServerId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { loading, error, saveSuccess } = useToolContext();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Tool Details Section with Save Button */}
      <ToolDetailsSection mcpServerId={mcpServerId} />
      
      {/* Main content area with tabs */}
      {loading ? (
        // Show skeleton tabs during loading
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <LoaderSection type="header" />
          </Box>
          
          {/* Show code editor skeleton as default */}
          <LoaderSection type="code" />
        </>
      ) : !error && (
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
          {activeTab === 0 && <CodeSection />}
          
          {/* Tool Settings Tab */}
          {activeTab === 1 && <ToolSettingsSection />}
        </>
      )}
      
      {/* Show skeleton settings if loading */}
      {loading && activeTab === 1 && <LoaderSection type="settings" />}
      
      {/* Terminal Section */}
      <TerminalSection />
      
      {/* Success snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => {}}
        message="Tool saved successfully"
      />
    </Box>
  );
};

export default ToolLaboratoryContainer;