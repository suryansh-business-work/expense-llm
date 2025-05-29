import { useState } from "react";
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatModelSettings from "./ChatModelSettings";
import ChatAppearanceSettings from "./ChatAppearanceSettings";
import ChatAdvancedSettings from "./ChatAdvancedSettings";
import ChatReportSettings from "./ChatReportSettings";
import ChatShareSettings from "./ChatShareSettings";
import ChatTopPannel from "../ChatTopPannel";

const ChatSettings = () => {
  const [expanded, setExpanded] = useState<string | false>("panel1");

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <section className="chat-settings">
      <ChatTopPannel />
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>AI Model</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mt={1}>
                  <ChatModelSettings />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>Appearance</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mt={1}>
                  <ChatAppearanceSettings />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel3"} onChange={handleChange("panel3")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>Advanced</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mt={1}>
                  <ChatAdvancedSettings />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel4"} onChange={handleChange("panel4")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>Report</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mt={1}>
                  <ChatReportSettings />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel5"} onChange={handleChange("panel5")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>Share</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mt={1}>
                  <ChatShareSettings />
                </Box>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSettings;
