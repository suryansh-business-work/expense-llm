import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Grid,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Default configuration
const DEFAULT_CONFIG = {
  name: "container-name",
  baseImage: "ubuntu:22.04",
  ports: [
    "3006:3006/tcp",
    "27017:27017/tcp",
    "1337:1337/tcp",
  ],
  volumes: [
    "./data:/data",
    "/logs:/var/log"
  ],
  env: {
    NODE_ENV: "development",
    DB_HOST: "localhost"
  },
  memory: "512m",
  cpu: 0.5,
  dependencies: [
    "sudo",
    "gnupg",
    "mongodb-org",
    "nodejs:22",
    "mongodb:8.0",
    "npm",
    "git",
    "curl",
    "lsof",
    "netstat"
  ],
  restartPolicy: "unless-stopped"
};

const HINTS = {
  name: "Optional. If left blank, Docker will auto-generate a name.",
  baseImage: "Required. The base Docker image to use, e.g. ubuntu:22.04, node:20, python:3.11.",
  ports: "Format: hostPort:containerPort/protocol (e.g. 8080:80/tcp). You can add multiple.",
  volumes: "Format: hostPath:containerPath (e.g. ./data:/data). You can add multiple.",
  env: "Environment variables as key-value pairs (e.g. NODE_ENV=production).",
  dependencies: "List of packages or images to install (e.g. nodejs:18, mongodb:6.0).",
  memory: "Memory limit for the container (e.g. 512m, 1g).",
  cpu: "CPU limit (number of cores, e.g. 0.5, 1, 2).",
  restartPolicy: "Controls how the container should be restarted if it exits."
};

export const AdvanceContainerConfig = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<any>({
    baseImage: 'ubuntu:22.04',
    ports: [''],
    volumes: [''],
    env: {},
    dependencies: [''],
    memory: '512m',
    cpu: 0.5,
    restartPolicy: 'unless-stopped'
  });

  const [envKeys, setEnvKeys] = useState<string[]>(['']);
  const [envValues, setEnvValues] = useState<string[]>(['']);

  // Load default values
  const loadDefaultValues = () => {
    setConfig(DEFAULT_CONFIG);

    const keys = Object.keys(DEFAULT_CONFIG.env || {});
    const values = keys.map(key => (DEFAULT_CONFIG.env ?? {})[key as keyof typeof DEFAULT_CONFIG.env]);

    if (keys.length === 0) {
      setEnvKeys(['']);
      setEnvValues(['']);
    } else {
      setEnvKeys(keys);
      setEnvValues(values);
    }
  };

  const handleTextChange = (e: any) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setConfig((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev: any) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleArrayChange = (index: number, value: string, arrayName: 'ports' | 'volumes' | 'dependencies') => {
    const newArray = [...(config[arrayName] || [])];
    newArray[index] = value;
    setConfig((prev: any) => ({ ...prev, [arrayName]: newArray }));
  };

  const addArrayItem = (arrayName: 'ports' | 'volumes' | 'dependencies') => {
    setConfig((prev: any) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), '']
    }));
  };

  const removeArrayItem = (index: number, arrayName: 'ports' | 'volumes' | 'dependencies') => {
    const newArray = [...(config[arrayName] || [])];
    newArray.splice(index, 1);
    setConfig((prev: any) => ({ ...prev, [arrayName]: newArray }));
  };

  const handleEnvKeyChange = (index: number, value: string) => {
    const newKeys = [...envKeys];
    newKeys[index] = value;
    setEnvKeys(newKeys);

    const newEnv: Record<string, string> = {};
    newKeys.forEach((key, i) => {
      if (key && envValues[i]) {
        newEnv[key] = envValues[i];
      }
    });
    setConfig((prev: any) => ({ ...prev, env: newEnv }));
  };

  const handleEnvValueChange = (index: number, value: string) => {
    const newValues = [...envValues];
    newValues[index] = value;
    setEnvValues(newValues);

    const newEnv: Record<string, string> = {};
    envKeys.forEach((key, i) => {
      if (key && newValues[i]) {
        newEnv[key] = newValues[i];
      }
    });
    setConfig((prev: any) => ({ ...prev, env: newEnv }));
  };

  const addEnvItem = () => {
    setEnvKeys([...envKeys, '']);
    setEnvValues([...envValues, '']);
  };

  const removeEnvItem = (index: number) => {
    const newKeys = [...envKeys];
    const newValues = [...envValues];
    newKeys.splice(index, 1);
    newValues.splice(index, 1);
    setEnvKeys(newKeys);
    setEnvValues(newValues);

    const newEnv: Record<string, string> = {};
    newKeys.forEach((key, i) => {
      if (key && newValues[i]) {
        newEnv[key] = newValues[i];
      }
    });
    setConfig((prev: any) => ({ ...prev, env: newEnv }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      alert("Container config submitted!\n\n" + JSON.stringify({
        ...config,
        ports: config.ports?.filter((p: string) => p.trim() !== ''),
        volumes: config.volumes?.filter((v: string) => v.trim() !== ''),
        dependencies: config.dependencies?.filter((d: string) => d.trim() !== ''),
      }, null, 2));
    }, 1000);
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          mt: 4,
          mb: 4,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="500" color="primary">
            Advanced Container Config
          </Typography>
          <Tooltip title="Load default configuration">
            <Button
              variant="outlined"
              color="secondary"
              onClick={loadDefaultValues}
              startIcon={<BookmarkIcon />}
            >
              Load Defaults
            </Button>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <TextField
                label="Container Name"
                name="name"
                value={config.name || ''}
                onChange={handleTextChange}
                placeholder="Leave empty for auto-generated name"
                variant="outlined"
                helperText={HINTS.name}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={HINTS.name}>
                      <InfoOutlinedIcon color="info" fontSize="small" />
                    </Tooltip>
                  )
                }}
              />
            </FormControl>

            <FormControl fullWidth required>
              <TextField
                required
                label="Base Image"
                name="baseImage"
                value={config.baseImage}
                onChange={handleTextChange}
                placeholder="e.g. ubuntu:22.04"
                variant="outlined"
                helperText={HINTS.baseImage}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={HINTS.baseImage}>
                      <InfoOutlinedIcon color="info" fontSize="small" />
                    </Tooltip>
                  )
                }}
              />
            </FormControl>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Ports
                </Typography>
                <Tooltip title={HINTS.ports}>
                  <InfoOutlinedIcon color="info" fontSize="small" />
                </Tooltip>
              </Box>
              <Stack spacing={2}>
                {config.ports?.map((port: string, index: number) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <TextField
                      fullWidth
                      value={port}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'ports')}
                      placeholder="e.g. 3000:3000/tcp or just 8080"
                      variant="outlined"
                      size="small"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeArrayItem(index, 'ports')}
                      disabled={config.ports?.length === 1 && index === 0}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addArrayItem('ports')}
                    size="small"
                  >
                    Add Port
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Volumes
                </Typography>
                <Tooltip title={HINTS.volumes}>
                  <InfoOutlinedIcon color="info" fontSize="small" />
                </Tooltip>
              </Box>
              <Stack spacing={2}>
                {config.volumes?.map((volume: string, index: number) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <TextField
                      fullWidth
                      value={volume}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'volumes')}
                      placeholder="e.g. ./data:/data"
                      variant="outlined"
                      size="small"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeArrayItem(index, 'volumes')}
                      disabled={config.volumes?.length === 1 && index === 0}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addArrayItem('volumes')}
                    size="small"
                  >
                    Add Volume
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Environment Variables
                </Typography>
                <Tooltip title={HINTS.env}>
                  <InfoOutlinedIcon color="info" fontSize="small" />
                </Tooltip>
              </Box>
              <Stack spacing={2}>
                {envKeys.map((key, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Key"
                      value={key}
                      onChange={(e) => handleEnvKeyChange(index, e.target.value)}
                      placeholder="e.g. NODE_ENV"
                      variant="outlined"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      value={envValues[index]}
                      onChange={(e) => handleEnvValueChange(index, e.target.value)}
                      placeholder="e.g. development"
                      variant="outlined"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeEnvItem(index)}
                      disabled={envKeys.length === 1 && index === 0}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addEnvItem}
                    size="small"
                  >
                    Add Environment Variable
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Dependencies
                </Typography>
                <Tooltip title={HINTS.dependencies}>
                  <InfoOutlinedIcon color="info" fontSize="small" />
                </Tooltip>
              </Box>
              <Stack spacing={2}>
                {config.dependencies?.map((dependency: string, index: number) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <TextField
                      fullWidth
                      value={dependency}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'dependencies')}
                      placeholder="e.g. nodejs:18, mongodb:6.0, postgresql:15"
                      variant="outlined"
                      size="small"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeArrayItem(index, 'dependencies')}
                      disabled={config.dependencies?.length === 1 && index === 0}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addArrayItem('dependencies')}
                    size="small"
                  >
                    Add Dependency
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Grid container spacing={2}>
              <Grid>
                <FormControl fullWidth>
                  <TextField
                    label="Memory Limit"
                    name="memory"
                    value={config.memory || ''}
                    onChange={handleTextChange}
                    placeholder="e.g. 512m, 1g"
                    variant="outlined"
                    helperText={HINTS.memory}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title={HINTS.memory}>
                          <InfoOutlinedIcon color="info" fontSize="small" />
                        </Tooltip>
                      )
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid>
                <FormControl fullWidth>
                  <TextField
                    type="number"
                    label="CPU Limit"
                    name="cpu"
                    value={config.cpu || ''}
                    onChange={handleNumberChange}
                    inputProps={{ min: "0.1", max: "16", step: "0.1" }}
                    variant="outlined"
                    helperText={HINTS.cpu}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title={HINTS.cpu}>
                          <InfoOutlinedIcon color="info" fontSize="small" />
                        </Tooltip>
                      )
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel id="restart-policy-label">Restart Policy</InputLabel>
              <Select
                labelId="restart-policy-label"
                id="restartPolicy"
                name="restartPolicy"
                value={config.restartPolicy || 'unless-stopped'}
                onChange={handleTextChange}
                label="Restart Policy"
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="always">Always</MenuItem>
                <MenuItem value="on-failure">On Failure</MenuItem>
                <MenuItem value="unless-stopped">Unless Stopped</MenuItem>
              </Select>
              <FormHelperText>
                {HINTS.restartPolicy}
              </FormHelperText>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ px: 3 }}
              >
                {loading ? 'Submitting...' : 'Submit Config'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setConfig({
                    baseImage: 'ubuntu:22.04',
                    ports: [''],
                    volumes: [''],
                    env: {},
                    dependencies: [''],
                    memory: '512m',
                    cpu: 0.5,
                    restartPolicy: 'unless-stopped'
                  });
                  setEnvKeys(['']);
                  setEnvValues(['']);
                }}
                startIcon={<RestartAltIcon />}
              >
                Reset Form
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default AdvanceContainerConfig;
