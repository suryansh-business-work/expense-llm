import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SelectExperienceLevel from "./components/SelectExperienceLevel";
import BasicConfiguration from "./components/BasicConfiguration";
import Dependencies from "./components/Dependencies";
import Resources from "./components/Resources";
import Network from "./components/Network";
import Config from "./components/Config";
import EnvironmentVariables from "./components/EnvironmentVariables";

interface NewMcpCreateAndUpdateDialogProps {
  open: boolean;
  onClose?: () => void;
}

const steps = [
  "Select Experience Level",
  "Basic Configuration",
  "Dependencies",
  "Resources",
  "Network",
  "Config",
  "Environment Variables"
];

export const NewMcpCreateAndUpdateDialog: React.FC<NewMcpCreateAndUpdateDialogProps> = ({
  open,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [experience, setExperience] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveStep(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: { xs: "100%", sm: "90%", md: "90%", lg: "90%" },
          maxWidth: "100vw",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 1.5, sm: 2 },
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "capitalize",
        }}
      >
        Create Or Update Mcp Server
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          bgcolor: theme.palette.background.default,
          p: { xs: 1.5, sm: 3 },
          minHeight: { xs: 420, sm: 720 }, // Fixed height for dialog content
          maxHeight: { xs: 420, sm: 720 }, // Prevents growing beyond this
          overflowY: "auto",
        }}
      >
        <Tabs
          value={activeStep}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            mb: 3,
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: { xs: 13, sm: 15 },
              minHeight: 44,
              px: { xs: 1, sm: 2 },
              textTransform: "capitalize",
            },
          }}
        >
          {steps.map((label, idx) => (
            <Tab
              key={label}
              label={label}
              disabled={
                (idx > 0 && activeStep < idx) ||
                (idx === 1 && !experience)
              }
              sx={{
                textTransform: "capitalize",
                minWidth: 120,
                maxWidth: "100vw",
              }}
            />
          ))}
        </Tabs>
        <Box
          sx={{
            minHeight: { xs: 280, sm: 580 },
            maxHeight: { xs: 280, sm: 580 },
            overflowY: "auto",
          }}
        >
          {activeStep === 0 && (
            <SelectExperienceLevel value={experience} onChange={setExperience} />
          )}
          {activeStep === 1 && <BasicConfiguration />}
          {activeStep === 2 && <Dependencies />}
          {activeStep === 3 && <Resources />}
          {activeStep === 4 && <Network />}
          {activeStep === 5 && <Config />}
          {activeStep === 6 && <EnvironmentVariables />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 1.5, sm: 3 }, pb: { xs: 1.5, sm: 2 } }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          color="inherit"
          variant="outlined"
          sx={{ textTransform: "capitalize" }}
        >
          Previous
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            color="primary"
            variant="contained"
            disabled={activeStep === 0 && !experience}
            sx={{ textTransform: "capitalize" }}
          >
            Next
          </Button>
        ) : (
          <Button
            color="primary"
            variant="contained"
            onClick={onClose}
            sx={{ textTransform: "capitalize" }}
          >
            Finish
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
