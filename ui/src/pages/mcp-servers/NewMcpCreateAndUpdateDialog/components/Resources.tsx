import React from "react";
import {
  Box,
  Typography,
  Slider,
  Stack,
  Paper,
  useTheme,
} from "@mui/material";

interface ResourcesProps {
  values?: {
    cpu?: number;
    memory?: number;
    swap?: number;
    disk?: number;
  };
  onChange?: (values: { cpu: number; memory: number; swap: number; disk: number }) => void;
}

const marksCPU = [
  { value: 0.5, label: "0.5" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 4, label: "4" },
  { value: 8, label: "8" },
];

const marksMemory = [
  { value: 512, label: "512MB" },
  { value: 1024, label: "1GB" },
  { value: 2048, label: "2GB" },
  { value: 4096, label: "4GB" },
  { value: 8192, label: "8GB" },
];

const marksSwap = [
  { value: 0, label: "0" },
  { value: 256, label: "256MB" },
  { value: 512, label: "512MB" },
  { value: 1024, label: "1GB" },
  { value: 2048, label: "2GB" },
];

const marksDisk = [
  { value: 5, label: "5GB" },
  { value: 10, label: "10GB" },
  { value: 20, label: "20GB" },
  { value: 50, label: "50GB" },
  { value: 100, label: "100GB" },
];

const defaultValues = {
  cpu: 0.5,
  memory: 512,
  swap: 0,
  disk: 5,
};

const sliderLabelStyle = {
  fontWeight: 600,
  mb: 1.5,
  fontSize: 16,
  color: "#222",
  letterSpacing: 0.1,
  display: "flex",
  alignItems: "center",
  gap: 1,
};

const info = {
  cpu: "Number of virtual CPUs allocated to the container. More CPUs allow more parallel processing.",
  memory: "Amount of RAM (memory) allocated to the container. Higher memory is needed for heavier workloads.",
  swap: "Swap space acts as overflow memory when RAM is full. Use with caution for performance.",
  disk: "Total disk image size for the container. Determines how much data and files you can store.",
};

const Resources: React.FC<ResourcesProps> = ({
  values = defaultValues,
  onChange,
}) => {
  const theme = useTheme();

  const [state, setState] = React.useState({
    cpu: values.cpu ?? 0.5,
    memory: values.memory ?? 512,
    swap: values.swap ?? 0,
    disk: values.disk ?? 5,
  });

  React.useEffect(() => {
    if (onChange) onChange(state);
    // eslint-disable-next-line
  }, [state]);

  const hideMarkLabels = {
    "& .MuiSlider-markLabel": {
      display: "none",
    },
  };

  const snapToMark = (marks: { value: number }[], value: number | number[]) => {
    if (Array.isArray(value)) return value;
    let closest = marks[0].value;
    let minDiff = Math.abs(value - closest);
    for (const mark of marks) {
      const diff = Math.abs(value - mark.value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = mark.value;
      }
    }
    return closest;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        bgcolor: "#fff",
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        maxWidth: 700,
        mx: "auto",
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.03)",
      }}
    >
      <Stack spacing={4}>
        <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
          Resources
        </Typography>
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              {/* CPU */}
              <Box>
                <Box sx={sliderLabelStyle}>
                  CPUs
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 2,
                      px: 1.5,
                      py: 0.2,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: 14,
                      color: theme.palette.primary.main,
                      display: "inline-block",
                    }}
                    component="span"
                  >
                    {state.cpu}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  {info.cpu}
                </Typography>
                <Slider
                  value={state.cpu}
                  min={0.5}
                  max={8}
                  step={null}
                  marks={marksCPU}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    setState((prev) => ({
                      ...prev,
                      cpu: snapToMark(marksCPU, value as number) as number,
                    }))
                  }
                  sx={{
                    mt: 3,
                    mb: 2,
                    ...hideMarkLabels,
                  }}
                />
              </Box>
            </div>
            <div className="col-12 col-md-6">
              {/* Memory */}
              <Box>
                <Box sx={sliderLabelStyle}>
                  Memory (MB)
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 2,
                      px: 1.5,
                      py: 0.2,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: 14,
                      color: theme.palette.primary.main,
                      display: "inline-block",
                    }}
                    component="span"
                  >
                    {state.memory >= 1024
                      ? `${state.memory / 1024} GB`
                      : `${state.memory} MB`}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  {info.memory}
                </Typography>
                <Slider
                  value={state.memory}
                  min={512}
                  max={8192}
                  step={null}
                  marks={marksMemory}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    setState((prev) => ({
                      ...prev,
                      memory: snapToMark(marksMemory, value as number) as number,
                    }))
                  }
                  sx={{
                    mt: 3,
                    mb: 2,
                    ...hideMarkLabels,
                  }}
                />
              </Box>
            </div>
            <div className="col-12 col-md-6">
              {/* Swap */}
              <Box>
                <Box sx={sliderLabelStyle}>
                  Swap (MB)
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 2,
                      px: 1.5,
                      py: 0.2,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: 14,
                      color: theme.palette.primary.main,
                      display: "inline-block",
                    }}
                    component="span"
                  >
                    {state.swap >= 1024
                      ? `${state.swap / 1024} GB`
                      : `${state.swap} MB`}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  {info.swap}
                </Typography>
                <Slider
                  value={state.swap}
                  min={0}
                  max={2048}
                  step={null}
                  marks={marksSwap}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    setState((prev) => ({
                      ...prev,
                      swap: snapToMark(marksSwap, value as number) as number,
                    }))
                  }
                  sx={{
                    mt: 3,
                    mb: 2,
                    ...hideMarkLabels,
                  }}
                />
              </Box>
            </div>
            <div className="col-12 col-md-6">
              {/* Disk */}
              <Box>
                <Box sx={sliderLabelStyle}>
                  Disk Image Size (GB)
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 2,
                      px: 1.5,
                      py: 0.2,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: 14,
                      color: theme.palette.primary.main,
                      display: "inline-block",
                    }}
                    component="span"
                  >
                    {state.disk} GB
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  {info.disk}
                </Typography>
                <Slider
                  value={state.disk}
                  min={5}
                  max={100}
                  step={null}
                  marks={marksDisk}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    setState((prev) => ({
                      ...prev,
                      disk: snapToMark(marksDisk, value as number) as number,
                    }))
                  }
                  sx={{
                    mt: 3,
                    mb: 2,
                    ...hideMarkLabels,
                  }}
                />
              </Box>
            </div>
          </div>
        </div>
      </Stack>
    </Paper>
  );
};

export default Resources;