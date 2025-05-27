import { useState } from "react";
import {
  Paper,
  Typography,
  Divider
} from "@mui/material";
import Appearance from "./Appearance";
import Notifications from "./Notifications";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    promotions: true,
    account: true,
    bots: true,
  });

  return (
    <div className="container mt-5">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Divider sx={{ my: 3 }} />
        <div className="row">
          <div className="col-12 col-md-6 mb-4">
            <Appearance />
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
