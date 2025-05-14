import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
} from "@mui/material";

// Dummy integrations data
const integrations = [
  {
    name: "Slack",
    description: "Connect your workspace to receive bot notifications and chat directly in Slack.",
    icon: <i className="fab fa-slack" style={{ fontSize: 32, color: "#4A154B" }} />,
    key: "slack",
    supportedTypes: ["finance", "daily-life", "professional"],
  },
  {
    name: "WhatsApp",
    description: "Enable WhatsApp messaging for instant bot responses and alerts.",
    icon: <i className="fab fa-whatsapp" style={{ fontSize: 32, color: "#25D366" }} />,
    key: "whatsapp",
    supportedTypes: ["finance", "professional"],
  },
  {
    name: "HubSpot",
    description: "Integrate with HubSpot to sync leads and automate workflows.",
    icon: <i className="fab fa-hubspot" style={{ fontSize: 32, color: "#FF7A59" }} />,
    key: "hubspot",
    supportedTypes: ["professional"],
  },
  {
    name: "Sibera",
    description: "Use Sibera for advanced AI automation and daily life assistance.",
    icon: <i className="fas fa-robot" style={{ fontSize: 32, color: "#1976d2" }} />,
    key: "sibera",
    supportedTypes: ["daily-life"],
  },
];

// Bot type map for chips
const botTypeMap: Record<string, { label: string; color: "primary" | "secondary" | "success" | "warning" }> = {
  finance: { label: "Finance", color: "primary" },
  "daily-life": { label: "Daily Life", color: "success" },
  professional: { label: "Professional", color: "secondary" },
};

// Light color chip styles
const chipStyleMap: Record<string, React.CSSProperties> = {
  finance: { backgroundColor: "#e3f2fd", color: "#1976d2" },
  "daily-life": { backgroundColor: "#e8f5e9", color: "#388e3c" },
  professional: { backgroundColor: "#f3e5f5", color: "#7b1fa2" },
};

export default function Integrations() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    slack: true,
    whatsapp: false,
    hubspot: false,
    sibera: false,
  });
  const [authDialog, setAuthDialog] = useState<{ open: boolean; key: string | null }>({ open: false, key: null });

  const handleSwitch = (key: string) => {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
    setAuthDialog({ open: true, key });
  };

  const handleDialogClose = () => setAuthDialog({ open: false, key: null });

  return (
    <div className="container" style={{ maxWidth: 1200, marginTop: 48 }}>
      <Box className="row mb-4" alignItems="center">
        <Box className="col-12 d-flex align-items-center" sx={{ gap: 2 }}>
          <i className="fas fa-plug" style={{ fontSize: 36, color: "#1976d2" }} />
          <Typography variant="h4" sx={{ fontWeight: 600, ml: 1 }}>
            Botify Integrations
          </Typography>
        </Box>
      </Box>
      <div className="row">
        {integrations.map((integration) => (
          <div className="col-12 col-sm-6 col-md-3 mb-4" key={integration.key}>
            <Card
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
                maxWidth: '900px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 18px 36px rgba(0, 0, 0, 0.08)',
                },
                p: 2,
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
            >
              <Box display="flex" alignItems="center" sx={{ width: "100%", mb: 1 }}>
                {integration.icon}
                <Typography variant="h6" sx={{ ml: 2, fontWeight: 500 }}>
                  {integration.name}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1, color: "#555" }}>
                {integration.description}
              </Typography>
              <Box mb={1}>
                {integration.supportedTypes.map((type) => (
                  <Chip
                    key={type}
                    label={botTypeMap[type]?.label || type}
                    size="small"
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      fontWeight: 500,
                      ...chipStyleMap[type],
                    }}
                  />
                ))}
              </Box>
              <Box mt="auto" sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {enabled[integration.key] ? "Enabled" : "Disabled"}
                </Typography>
                <Switch
                  checked={enabled[integration.key]}
                  onChange={() => handleSwitch(integration.key)}
                  color="primary"
                  inputProps={{ "aria-label": `Enable ${integration.name}` }}
                />
              </Box>
            </Card>
          </div>
        ))}
      </div>
      <Dialog open={authDialog.open} onClose={handleDialogClose}>
        <DialogTitle>Authenticate Integration</DialogTitle>
        <DialogContent>
          <Typography>
            Please authenticate or configure <b>{integrations.find(i => i.key === authDialog.key)?.name}</b> integration.
          </Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleDialogClose}>
              Dummy Authenticate
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}