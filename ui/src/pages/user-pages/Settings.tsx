import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";

export default function Settings() {
  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    promotions: true,
    account: true,
    bots: true,
  });

  // Communication settings
  const [emailServer, setEmailServer] = useState("gmail");
  const [smsServer, setSmsServer] = useState("twilio");

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleDelete = () => {
    setDeleteSuccess(true);
    setTimeout(() => {
      setOpenDeleteDialog(false);
      setDeleteSuccess(false);
    }, 1500);
  };

  return (
    <div className="container" style={{ maxWidth: 900, marginTop: 48 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Divider sx={{ my: 3 }} />
        <div className="row">
          {/* Appearance */}
          <div className="col-12 col-md-6 mb-6">
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Appearance
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "#f5f7fa",
                borderRadius: 2,
                p: 2,
                width: "fit-content",
              }}
            >
              <span style={{ fontSize: 22, color: darkMode ? "#1976d2" : "#888" }}>
                <i className="fas fa-sun" />
              </span>
              <Box
                sx={{
                  width: 48,
                  height: 32,
                  borderRadius: 2,
                  border: "2px solid #1976d2",
                  background: darkMode ? "#222" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: darkMode ? "flex-end" : "flex-start",
                  cursor: "pointer",
                  transition: "background 0.3s",
                  px: 0.5,
                }}
                onClick={() => setDarkMode((v) => !v)}
                aria-label="Toggle dark mode"
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    background: darkMode ? "#1976d2" : "#e0e0e0",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: darkMode ? "#fff" : "#888",
                    transition: "background 0.3s",
                  }}
                >
                  <i className={`fas ${darkMode ? "fa-moon" : "fa-sun"}`} />
                </Box>
              </Box>
              <span style={{ fontSize: 22, color: darkMode ? "#888" : "#1976d2" }}>
                <i className="fas fa-moon" />
              </span>
              <Typography sx={{ ml: 2, fontWeight: 500 }}>
                {darkMode ? "Dark Mode" : "Light Mode"}
              </Typography>
            </Box>
          </div>
          {/* Notifications */}
          <div className="col-12 col-md-6 mb-6">
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Notifications
            </Typography>
            <Paper elevation={0} sx={{ p: 2, background: "#f5f7fa", borderRadius: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifications.promotions}
                      onChange={() =>
                        setNotifications((n) => ({
                          ...n,
                          promotions: !n.promotions,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Promotions"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifications.account}
                      onChange={() =>
                        setNotifications((n) => ({
                          ...n,
                          account: !n.account,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Account Related"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifications.bots}
                      onChange={() =>
                        setNotifications((n) => ({
                          ...n,
                          bots: !n.bots,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Bots Messages"
                />
              </FormGroup>
            </Paper>
          </div>
          {/* Communication */}
          <div className="col-12 col-md-6 mb-6">
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Communication
            </Typography>
            <Paper elevation={0} sx={{ p: 2, background: "#f5f7fa", borderRadius: 2 }}>
              <Box sx={{ mb: 2 }}>
                <InputLabel sx={{ mb: 1 }}>Email Server</InputLabel>
                <Select
                  value={emailServer}
                  onChange={(e) => setEmailServer(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ borderRadius: 2, background: "#fff" }}
                >
                  <MenuItem value="gmail">Gmail</MenuItem>
                  <MenuItem value="outlook">Outlook</MenuItem>
                  <MenuItem value="custom">Custom SMTP</MenuItem>
                </Select>
              </Box>
              <Box>
                <InputLabel sx={{ mb: 1 }}>SMS Server</InputLabel>
                <Select
                  value={smsServer}
                  onChange={(e) => setSmsServer(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ borderRadius: 2, background: "#fff" }}
                >
                  <MenuItem value="twilio">Twilio</MenuItem>
                  <MenuItem value="msg91">MSG91</MenuItem>
                  <MenuItem value="custom">Custom SMS</MenuItem>
                </Select>
              </Box>
            </Paper>
          </div>
        </div>
        <Divider sx={{ my: 3 }} />
        {/* Danger Zone */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Danger Zone
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpenDeleteDialog(true)}
          >
            Delete My Data
          </Button>
        </Box>
      </Paper>
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Your Data</DialogTitle>
        <DialogContent>
          {deleteSuccess ? (
            <Alert severity="success">Your data has been deleted!</Alert>
          ) : (
            <Typography>
              Are you sure you want to delete all your data? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {!deleteSuccess && (
            <>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}