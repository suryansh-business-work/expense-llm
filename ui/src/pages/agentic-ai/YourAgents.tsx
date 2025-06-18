import React from "react";
import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const YourAgents: React.FC = () => {
  // Placeholder for user's agents
  const agents: Array<{ id: number; name: string; description: string }> = [];

  return (
    <Box sx={{ py: 4, px: { xs: 1, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <SmartToyIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
        <Typography variant="h5" fontWeight={700}>
          Your Agents
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
            // onClick={...} // Add handler to open RequestAnAgent dialog
          >
            Request an Agent
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PersonAddAltIcon />}
            sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
            // onClick={...} // Add handler to open CreateAgent dialog
          >
            Create Agent
          </Button>
        </Stack>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here you can manage, monitor, and interact with your custom AI agents.
      </Typography>

      {agents.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: "#f7f8fa",
            maxWidth: 500,
            margin: "40px auto",
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            You don&apos;t have any agents yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Request a custom agent or create your own to get started.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
              // onClick={...}
            >
              Request an Agent
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PersonAddAltIcon />}
              sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
              // onClick={...}
            >
              Create Agent
            </Button>
          </Stack>
        </Paper>
      ) : (
        <div className="row">
          {agents.map((agent) => (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={agent.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: "#f7f8fa",
                  border: "1px solid #e3eafc",
                  position: "relative",
                  transition: "box-shadow 0.2s, border 0.2s",
                  "&:hover": {
                    boxShadow: 6,
                    borderColor: "#1976d2",
                  },
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {agent.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {agent.description}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2, fontWeight: 600, px: 2, mt: "auto" }}
                  disabled
                >
                  Manage Agent
                </Button>
              </Paper>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default YourAgents;