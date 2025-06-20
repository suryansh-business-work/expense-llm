import React from "react";
import {
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Slider,
  Button,
  Tooltip,
} from "@mui/material";

type RestartPolicy = "no" | "always" | "on-failure" | "unless-stopped";

const RESTART_POLICIES: { value: RestartPolicy; label: string; desc: string }[] = [
  { value: "no", label: "No", desc: "Never restart the container automatically." },
  { value: "always", label: "Always", desc: "Always restart the container if it stops." },
  { value: "on-failure", label: "On Failure", desc: "Restart only if the container exits with a non-zero status." },
  { value: "unless-stopped", label: "Unless Stopped", desc: "Always restart unless the container is explicitly stopped." },
];

const ENVIRONMENTS = [
  { value: "development", label: "Development", desc: "Default settings for development and debugging." },
  { value: "testing", label: "Testing", desc: "For running tests. Choose scale below." },
  { value: "production", label: "Production", desc: "Optimized for production. Choose scale below." },
];

const FILE_CDNS = [
  { value: "imagekit", label: "Image Kit", desc: "Use ImageKit CDN for file delivery." },
];

interface EnvVar {
  key: string;
  value: string;
}

interface ConfigProps {
  values?: {
    restartPolicy?: RestartPolicy;
    terminalAccess?: boolean;
    fileCdn?: string;
    fileManager?: boolean;
    environment?: string;
    testingScale?: number;
    productionScale?: number;
    envVars?: EnvVar[];
  };
  onChange?: (values: any) => void;
}

const defaultValues = {
  restartPolicy: "no" as RestartPolicy,
  terminalAccess: false,
  fileCdn: "imagekit",
  fileManager: false,
  environment: "development",
  testingScale: 1,
  productionScale: 1,
  envVars: [],
};

const labelStyle = { fontWeight: 600, mb: 0.5, fontSize: 15 };

const Config: React.FC<ConfigProps> = ({
  values = defaultValues,
  onChange,
}) => {
  const [state, setState] = React.useState({
    ...defaultValues,
    ...values,
  });

  React.useEffect(() => {
    if (onChange) onChange(state);
    // eslint-disable-next-line
  }, [state]);

  const handleChange = (field: string, value: any) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  // Hide all slider mark labels by overriding their display
  const hideMarkLabels = {
    "& .MuiSlider-markLabel": {
      display: "none",
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        bgcolor: "#fff",
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        maxWidth: 900,
        mx: "auto",
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.03)",
      }}
    >
      <Stack spacing={4}>
        <Typography variant="h6" fontWeight={700} textAlign="center">
          Configurations
        </Typography>
        <div className="container-fluid">
          <div className="row g-4">
            {/* Restart Policy */}
            <div className="col-12 col-md-6">
              <FormControl fullWidth>
                <InputLabel id="restart-policy-label">Restart Policy</InputLabel>
                <Select
                  labelId="restart-policy-label"
                  value={state.restartPolicy}
                  label="Restart Policy"
                  onChange={(e) => handleChange("restartPolicy", e.target.value)}
                >
                  {RESTART_POLICIES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box>
                        <Typography fontWeight={600}>{opt.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opt.desc}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Controls how the container restarts on failure or stop.
                </Typography>
              </FormControl>
            </div>

            {/* Terminal Access */}
            <div className="col-12 col-md-6">
              <Box>
                <Typography sx={labelStyle}>Terminal Access</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.terminalAccess}
                      onChange={(e) => handleChange("terminalAccess", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Allow shell/terminal access to the container"
                />
                <Typography variant="caption" color="text.secondary">
                  Enable to allow users to access the container terminal.
                </Typography>
              </Box>
            </div>

            {/* File CDN */}
            <div className="col-12 col-md-6">
              <FormControl fullWidth>
                <InputLabel id="file-cdn-label">File CDN</InputLabel>
                <Select
                  labelId="file-cdn-label"
                  value={state.fileCdn}
                  label="File CDN"
                  onChange={(e) => handleChange("fileCdn", e.target.value)}
                >
                  {FILE_CDNS.map((cdn) => (
                    <MenuItem key={cdn.value} value={cdn.value}>
                      <Box>
                        <Typography fontWeight={600}>{cdn.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cdn.desc}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Select a CDN provider for file delivery.
                </Typography>
              </FormControl>
            </div>

            {/* File Manager */}
            <div className="col-12 col-md-6">
              <Box>
                <Typography sx={labelStyle}>File Manager</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.fileManager}
                      onChange={(e) => handleChange("fileManager", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable file manager for this container"
                />
                <Typography variant="caption" color="text.secondary">
                  Allow users to browse and manage files in the container.
                </Typography>
              </Box>
            </div>

            {/* Environment */}
            <div className="col-12 col-md-6">
              <Box>
                <Typography sx={labelStyle}>Environment</Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  {ENVIRONMENTS.map((env) => (
                    <Tooltip key={env.value} title={env.desc} arrow>
                      <Button
                        variant={state.environment === env.value ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => handleChange("environment", env.value)}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {env.label}
                      </Button>
                    </Tooltip>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Choose the environment for your container.
                </Typography>
                {state.environment === "testing" && (
                  <Box sx={{ maxWidth: 320, mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography gutterBottom fontWeight={500} sx={{ mr: 2 }}>
                        Testing Scale
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.5,
                          py: 0.2,
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          fontWeight: 500,
                          fontSize: 14,
                          color: "#1976d2",
                          display: "inline-block",
                        }}
                        component="span"
                      >
                        {state.testingScale}X
                      </Typography>
                    </Box>
                    <Slider
                      value={state.testingScale}
                      min={1}
                      max={3}
                      step={1}
                      marks={[{ value: 1 }, { value: 2 }, { value: 3 }]}
                      valueLabelDisplay="off"
                      onChange={(_, value) =>
                        handleChange("testingScale", value as number)
                      }
                      sx={hideMarkLabels}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {`Your testing environment will run at ${state.testingScale}X scale.`}
                    </Typography>
                  </Box>
                )}
                {state.environment === "production" && (
                  <Box sx={{ maxWidth: 400, mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography gutterBottom fontWeight={500} sx={{ mr: 2 }}>
                        Production Scale
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.5,
                          py: 0.2,
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          fontWeight: 500,
                          fontSize: 14,
                          color: "#1976d2",
                          display: "inline-block",
                        }}
                        component="span"
                      >
                        {state.productionScale}X
                      </Typography>
                    </Box>
                    <Slider
                      value={state.productionScale}
                      min={1}
                      max={100}
                      step={1}
                      marks={[
                        { value: 1 },
                        { value: 2 },
                        { value: 3 },
                        { value: 10 },
                        { value: 50 },
                        { value: 100 },
                      ]}
                      valueLabelDisplay="off"
                      onChange={(_, value) =>
                        handleChange("productionScale", value as number)
                      }
                      sx={hideMarkLabels}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {`Your production environment will run at ${state.productionScale}X scale.`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </div>
          </div>
        </div>
      </Stack>
    </Paper>
  );
};

export default Config;