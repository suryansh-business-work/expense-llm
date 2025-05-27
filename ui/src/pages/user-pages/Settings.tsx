import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Divider
} from "@mui/material";
import Appearance from "./Appearance";
import Notifications from "./Notifications";

const API_BASE = "http://localhost:3000/design-system";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    promotions: true,
    account: true,
    bots: true,
  });

  // Theme API integration
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const res = await fetch(`${API_BASE}/get`);
      const data = await res.json();
      if (Array.isArray(data.data)) {
        if (data.data.length && !selectedThemeId) {
          setSelectedThemeId(data.data[0].themeId);
        }
      }
    } catch (err) { }
  };

  return (
    <div className="container mt-5">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Divider sx={{ my: 3 }} />
        <div className="row">
          <div className="col-12 col-md-6 mb-4">
            <Appearance
              selectedThemeId={selectedThemeId}
              setSelectedThemeId={setSelectedThemeId}
            />
          </div>
          <div className="col-12 col-md-6 mb-4">
            <Notifications
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </div>
        <Divider sx={{ my: 3 }} />
      </Paper>
    </div>
  );
}
