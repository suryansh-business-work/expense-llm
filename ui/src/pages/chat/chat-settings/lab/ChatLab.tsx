import { useState } from "react";
import { Box, Paper, Stepper, Step, StepLabel, Button } from "@mui/material";
import PromptSection from "./prompt-management/PromptSection";
import McpServers from "./MCPServers";

const steps = ["Prompt", "Mcp Servers"];

const ChatLab = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ width: "100%" }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box sx={{ mt: 4 }}>
                {activeStep === 0 && <PromptSection />}
                {activeStep === 1 && <McpServers />}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                <Button
                  disabled={activeStep === steps.length - 1}
                  onClick={handleNext}
                  variant="contained"
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default ChatLab;