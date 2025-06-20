import React from "react";
import {
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import { motion, AnimatePresence } from "framer-motion";

interface SelectExperienceLevelProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: 16, transition: { duration: 0.18, ease: "easeIn" } },
};

const getBorderColor = (selected: boolean, color: string, theme: any) =>
  selected ? color : theme.palette.divider;

const getBgColor = (selected: boolean, color: string) => {
  if (!selected) return "#fff";
  if (color === "#4caf50") return "#e0f2e9";
  if (color === "#ffb300") return "#fff3cd";
  if (color === "#f44336") return "#ffeaea";
  return "#f5f5f5";
};

const SelectExperienceLevel: React.FC<SelectExperienceLevelProps> = ({
  value,
  onChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AnimatePresence mode="wait">
      <motion.div key="experience-step" {...fadeIn}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "#fff",
            borderRadius: 0,
            maxWidth: 900,
            mx: "auto",
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.03)",
            transition: "box-shadow 0.2s",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 700,
              textAlign: "center",
              color: theme.palette.primary.main,
              letterSpacing: 0.2,
              textTransform: "capitalize",
            }}
          >
            What's your experience level in development?
          </Typography>
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, val) => onChange(val)}
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              width: "100%",
              alignItems: "stretch",
              mt: 2,
            }}
          >
            <ToggleButton
              value="yes"
              sx={{
                width: "100%",
                minHeight: 72,
                justifyContent: "flex-start",
                borderRadius: 0,
                border: `2px solid ${getBorderColor(value === "yes", "#4caf50", theme)} !important`,
                bgcolor: getBgColor(value === "yes", "#4caf50"),
                boxShadow: value === "yes" ? "0 2px 8px #4caf5012" : "none",
                transition: "all 0.18s",
                py: 2,
                px: 2.5,
                gap: 2,
                textTransform: "capitalize",
                "&:hover": {
                  bgcolor: "#d2ede0",
                  borderColor: "#4caf50",
                },
                flex: 1,
                alignItems: "center",
              }}
            >
              <SportsMmaIcon sx={{ color: "#4caf50", fontSize: 28 }} />
              <Box>
                <Typography fontWeight={600} color="#222" sx={{ textTransform: "capitalize" }}>
                  Yes, I'm experienced
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  I can handle advanced setups and configs.
                </Typography>
              </Box>
            </ToggleButton>
            <ToggleButton
              value="little"
              sx={{
                width: "100%",
                minHeight: 72,
                justifyContent: "flex-start",
                borderRadius: 0,
                border: `2px solid ${getBorderColor(value === "little", "#ffb300", theme)} !important`,
                bgcolor: getBgColor(value === "little", "#ffb300"),
                boxShadow: value === "little" ? "0 2px 8px #ffb30012" : "none",
                transition: "all 0.18s",
                py: 2,
                px: 2.5,
                gap: 2,
                textTransform: "capitalize",
                "&:hover": {
                  bgcolor: "#ffe9b3",
                  borderColor: "#ffb300",
                },
                flex: 1,
                alignItems: "center",
              }}
            >
              <EmojiPeopleIcon sx={{ color: "#ffb300", fontSize: 28 }} />
              <Box>
                <Typography fontWeight={600} color="#222" sx={{ textTransform: "capitalize" }}>
                  A little, I'm just starting
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  I know basics, but need some guidance.
                </Typography>
              </Box>
            </ToggleButton>
            <ToggleButton
              value="no"
              sx={{
                width: "100%",
                minHeight: 72,
                justifyContent: "flex-start",
                borderRadius: 0,
                border: `2px solid ${getBorderColor(value === "no", "#f44336", theme)} !important`,
                bgcolor: getBgColor(value === "no", "#f44336"),
                boxShadow: value === "no" ? "0 2px 8px #f4433612" : "none",
                transition: "all 0.18s",
                py: 2,
                px: 2.5,
                gap: 2,
                textTransform: "capitalize",
                "&:hover": {
                  bgcolor: "#ffd6d6",
                  borderColor: "#f44336",
                },
                flex: 1,
                alignItems: "center",
              }}
            >
              <ChildCareIcon sx={{ color: "#f44336", fontSize: 28 }} />
              <Box>
                <Typography fontWeight={600} color="#222" sx={{ textTransform: "capitalize" }}>
                  Not at all
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  I'm completely new to development.
                </Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

export default SelectExperienceLevel;