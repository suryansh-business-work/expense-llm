import React from "react";
import { Box, Typography, Stack, TextField, IconButton, Button, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export interface EnvVar {
  key: string;
  value: string;
}

const EnvironmentVariables: React.FC = () => {
  const [envVars, setEnvVars] = React.useState<EnvVar[]>([]);

  const handleEnvVarChange = (idx: number, field: "key" | "value", value: string) => {
    const updated = [...envVars];
    updated[idx][field] = value;
    setEnvVars(updated);
  };

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const handleDeleteEnvVar = (idx: number) => {
    const updated = [...envVars];
    updated.splice(idx, 1);
    setEnvVars(updated);
  };

  return (
    <Box>
      <Typography fontWeight={600} sx={{ mb: 1 }}>
        Environment Variables
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Add custom environment variables (key-value pairs) for your container.
      </Typography>
      <Stack spacing={2}>
        {envVars.map((env, idx) => (
          <Stack direction="row" spacing={1} alignItems="center" key={idx}>
            <TextField
              label="Key"
              value={env.key}
              onChange={(e) => handleEnvVarChange(idx, "key", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              placeholder="e.g. NODE_ENV"
            />
            <TextField
              label="Value"
              value={env.value}
              onChange={(e) => handleEnvVarChange(idx, "value", e.target.value)}
              size="small"
              sx={{ flex: 2 }}
              placeholder="e.g. production"
            />
            <Tooltip title="Remove variable">
              <IconButton
                aria-label="delete"
                onClick={() => handleDeleteEnvVar(idx)}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddEnvVar}
          sx={{ width: "fit-content", textTransform: "capitalize" }}
        >
          Add Variable
        </Button>
      </Stack>
    </Box>
  );
};

export default EnvironmentVariables;