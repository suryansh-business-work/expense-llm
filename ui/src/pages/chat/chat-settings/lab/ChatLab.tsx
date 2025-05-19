import { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import PromptSection from "./prompt-management/PromptSection";
import FunctionsSection from "./FunctionsSection";

const ChatLab = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: "flex" }}>
              {/* Vertical Tabs */}
              <Tabs
                orientation="vertical"
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ borderRight: 1, borderColor: "divider", minWidth: 180 }}
              >
                <Tab label="Prompt" />
                <Tab label="Functions" />
              </Tabs>
              {/* Tab Panels */}
              <Box sx={{ flex: 1, pl: 3 }}>
                {tab === 0 && <PromptSection />}
                {tab === 1 && <FunctionsSection />}
              </Box>
            </Box>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default ChatLab;