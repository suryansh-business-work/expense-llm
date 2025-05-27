import { useState } from "react";
import {
  Box,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ThemeSection from "./theme/ThemeList";
import Components from "./Components";

export default function ComponentList() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedComponentId, setSelectedComponentId] = useState<string>("");
  const [categorySearch, setCategorySearch] = useState("");
  const [componentSearch, setComponentSearch] = useState("");

  // Handlers
  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedComponentId("");
    setComponentSearch("");
  };

  const handleComponentSelect = (id: string) => {
    setSelectedComponentId(id);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Settings Bar */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box sx={{ flexGrow: 1, fontWeight: 700, fontSize: 24 }}>
          Components Management
        </Box>
        <IconButton onClick={() => setSettingsOpen(true)} size="large">
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Settings Drawer: Theme and Property Management */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{ zIndex: 1300 }}
        PaperProps={{ sx: { width: "90vw", p: 3 } }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Theme CRUD Section */}
          <ThemeSection
            selectedThemeId={selectedThemeId}
            setSelectedThemeId={setSelectedThemeId}
          />
          <Divider sx={{ my: 3 }} />
          {/* ...PropertySection here... */}
        </Box>
      </Drawer>

      {/* All three columns UI moved to ThemeList */}
      <Components
        categorySearch={categorySearch}
        componentSearch={componentSearch}
        selectedCategoryId={selectedCategoryId}
        selectedComponentId={selectedComponentId}
        handleCategorySelect={handleCategorySelect}
        handleComponentSelect={handleComponentSelect}
        setCategorySearch={setCategorySearch}
        setComponentSearch={setComponentSearch}
      />
    </Box>
  );
}
