import React, { useState } from 'react';
import { createContainer } from '../../services/api';
import { ContainerConfig } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// Default configuration based on the provided JSON
const DEFAULT_CONFIG: ContainerConfig = {
  name: "container-name",
  baseImage: "ubuntu:22.04",
  ports: [
    "3006:3006/tcp",
    "27017"
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
    "nodejs:22",
    "mongodb:8.0"
  ],
  restartPolicy: "unless-stopped"
};

const ContainerForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initial empty config
  const [config, setConfig] = useState<ContainerConfig>({
    baseImage: 'ubuntu:22.04',
    ports: [''],
    volumes: [''],
    env: {},
    dependencies: [''],
    memory: '512m',
    cpu: 0.5,
    restartPolicy: 'unless-stopped'
  });
  
  // Initialize env keys/values (empty initially)
  const [envKeys, setEnvKeys] = useState<string[]>(['']);
  const [envValues, setEnvValues] = useState<string[]>(['']);
  
  // Load default values function
  const loadDefaultValues = () => {
    setConfig(DEFAULT_CONFIG);
    
    // Extract environment variables for the form
    const keys = Object.keys(DEFAULT_CONFIG.env || {});
    const values = keys.map(key => (DEFAULT_CONFIG.env ?? {})[key]);
    
    if (keys.length === 0) {
      // If no env vars in default, add one empty field
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
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleArrayChange = (index: number, value: string, arrayName: 'ports' | 'volumes' | 'dependencies') => {
    const newArray = [...(config[arrayName] || [])];
    newArray[index] = value;
    setConfig(prev => ({ ...prev, [arrayName]: newArray }));
  };
  
  const addArrayItem = (arrayName: 'ports' | 'volumes' | 'dependencies') => {
    setConfig(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), '']
    }));
  };
  
  const removeArrayItem = (index: number, arrayName: 'ports' | 'volumes' | 'dependencies') => {
    const newArray = [...(config[arrayName] || [])];
    newArray.splice(index, 1);
    setConfig(prev => ({ ...prev, [arrayName]: newArray }));
  };
  
  const handleEnvKeyChange = (index: number, value: string) => {
    const newKeys = [...envKeys];
    newKeys[index] = value;
    setEnvKeys(newKeys);
    
    // Update env object in config
    const newEnv: Record<string, string> = {};
    newKeys.forEach((key, i) => {
      if (key && envValues[i]) {
        newEnv[key] = envValues[i];
      }
    });
    setConfig(prev => ({ ...prev, env: newEnv }));
  };
  
  const handleEnvValueChange = (index: number, value: string) => {
    const newValues = [...envValues];
    newValues[index] = value;
    setEnvValues(newValues);
    
    // Update env object in config
    const newEnv: Record<string, string> = {};
    envKeys.forEach((key, i) => {
      if (key && newValues[i]) {
        newEnv[key] = newValues[i];
      }
    });
    setConfig(prev => ({ ...prev, env: newEnv }));
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
    
    // Update env object in config
    const newEnv: Record<string, string> = {};
    newKeys.forEach((key, i) => {
      if (key && newValues[i]) {
        newEnv[key] = newValues[i];
      }
    });
    setConfig(prev => ({ ...prev, env: newEnv }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Filter out empty array items
      const formattedConfig: ContainerConfig = {
        ...config,
        ports: config.ports?.filter(port => port.trim() !== '') || [],
        volumes: config.volumes?.filter(volume => volume.trim() !== '') || [],
        dependencies: config.dependencies?.filter(dep => dep.trim() !== '') || []
      };
      
      const response = await createContainer(formattedConfig);
      console.log('Container created:', response);
      navigate('/containers');
    } catch (error) {
      console.error('Error creating container:', error);
      setError(`Failed to create container: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4, 
          mb: 4,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="500" color="primary">
            Create New Container
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
                label="Container Name (Optional)"
                name="name"
                value={config.name || ''}
                onChange={handleTextChange}
                placeholder="Leave empty for auto-generated name"
                variant="outlined"
                helperText="Optional name for your container"
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
                helperText="The base Docker image to use"
              />
            </FormControl>
            
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Ports (containerPort:hostPort/protocol)
              </Typography>
              <Stack spacing={2}>
                {config.ports?.map((port, index) => (
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Volumes (hostPath:containerPath)
              </Typography>
              <Stack spacing={2}>
                {config.volumes?.map((volume, index) => (
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Environment Variables
              </Typography>
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Dependencies (type:version)
              </Typography>
              <Stack spacing={2}>
                {config.dependencies?.map((dependency, index) => (
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
            
            <FormControl fullWidth>
              <TextField
                label="Memory Limit"
                name="memory"
                value={config.memory || ''}
                onChange={handleTextChange}
                placeholder="e.g. 512m, 1g"
                variant="outlined"
                helperText="Format: 512m, 1g, etc."
              />
            </FormControl>
            
            <FormControl fullWidth>
              <TextField
                type="number"
                label="CPU Limit"
                name="cpu"
                value={config.cpu || ''}
                onChange={handleNumberChange}
                inputProps={{ min: "0.1", max: "16", step: "0.1" }}
                variant="outlined"
                helperText="Number of CPU cores (0.1 to 16)"
              />
            </FormControl>
            
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
                Controls how the container should be restarted
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
                {loading ? 'Creating...' : 'Create Container'}
              </Button>
              <Button 
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/containers')}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button 
                variant="outlined"
                color="warning"
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

export default ContainerForm;
