import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Chip,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TableContainer,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Table,
  Skeleton
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Refresh as RestartIcon,
  Delete as DeleteIcon,
  Edit as RenameIcon,
  Info as InspectIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Terminal as TerminalIcon,
  Search as SearchIcon,
  CopyAll as CopyIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';

// Define interfaces for our data
interface Container {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  State: string;
  Status: string;
  Ports: Array<{
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
  }>;
}

interface ContainerDetails {
  Id: string;
  Name: string;
  Config: {
    Image: string;
    Cmd: string[];
    Env: string[];
  };
  State: {
    Status: string;
    Running: boolean;
    StartedAt: string;
    FinishedAt: string;
  };
  NetworkSettings: {
    Ports: Record<string, Array<{ HostIp: string; HostPort: string }>>;
  };
  Mounts: Array<{
    Source: string;
    Destination: string;
    Type: string;
  }>;
}

interface AlertMessage {
  type: "success" | "error" | "info";
  message: string;
}

// Form interfaces
interface ServiceForm {
  name: string;
  image: string;
  command: string;
  ports: string;
  environment: string;
  volumes: string;
  workdir: string;
  network: string;
}

interface ContainerForm {
  services: ServiceForm[];
  createVolumes: boolean;
  createNetwork: boolean;
  networkName: string;
}

// Validation schema
const serviceSchema = Joi.object({
  name: Joi.string().allow('').optional(),
  image: Joi.string().required().messages({
    'string.empty': 'Image is required',
  }),
  command: Joi.string().allow('').optional(),
  ports: Joi.string().allow('').optional(),
  environment: Joi.string().allow('').optional(),
  volumes: Joi.string().allow('').optional(),
  workdir: Joi.string().allow('').optional(),
  network: Joi.string().allow('').optional(),
});

const formSchema = Joi.object({
  services: Joi.array().items(serviceSchema).min(1).required(),
  createVolumes: Joi.boolean().default(false),
  createNetwork: Joi.boolean().default(false),
  networkName: Joi.string().when('createNetwork', {
    is: true,
    then: Joi.string().required().messages({
      'string.empty': 'Network name is required when creating a network',
    }),
    otherwise: Joi.string().allow('').optional(),
  }),
});

const DockerManagement: React.FC = () => {
  // State for container list and selected container
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [containerDetails, setContainerDetails] = useState<ContainerDetails | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // New state variables for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [containerMenuAnchor, setContainerMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Form setup with React Hook Form
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<ContainerForm>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      services: [{
        name: '',
        image: '',
        command: '',
        ports: '',
        environment: '',
        volumes: '',
        workdir: '',
        network: '',
      }],
      createVolumes: false,
      createNetwork: false,
      networkName: '',
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "services"
  });

  const createNetwork = watch('createNetwork');
  
  // Fetch containers on component mount
  useEffect(() => {
    fetchContainers();
  }, []);
  
  // Function to fetch all containers
  const fetchContainers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/v1/api/code-run/docker/containers');
      
      if (Array.isArray(response.data)) {
        setContainers(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setContainers(response.data.data);
      } else if (response.data && response.data.containers && Array.isArray(response.data.containers)) {
        setContainers(response.data.containers);
      } else {
        console.error('Unexpected API response format:', response.data);
        setContainers([]);
        setAlert({
          type: 'error',
          message: 'Invalid response format from the server'
        });
      }
    } catch (error: any) {
      console.error('Error fetching containers:', error);
      setContainers([]);
      setAlert({
        type: 'error',
        message: `Failed to fetch containers: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to inspect a container
  const inspectContainer = async (containerId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/v1/api/code-run/docker/container/${containerId}`);
      setContainerDetails(response.data);
      setInspectDialogOpen(true);
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `Failed to inspect container: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to start a container
  const startContainer = async (containerId: string) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/v1/api/code-run/docker/container/${containerId}/start`);
      setAlert({
        type: 'success',
        message: 'Container started successfully'
      });
      fetchContainers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `Failed to start container: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to stop a container
  const stopContainer = async (containerId: string) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/v1/api/code-run/docker/container/${containerId}/stop`);
      setAlert({
        type: 'success',
        message: 'Container stopped successfully'
      });
      fetchContainers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `Failed to stop container: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to restart a container
  const restartContainer = async (containerId: string) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/v1/api/code-run/docker/container/${containerId}/restart`);
      setAlert({
        type: 'success',
        message: 'Container restarted successfully'
      });
      fetchContainers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `Failed to restart container: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to delete a container
  const deleteContainer = async () => {
    if (!selectedContainer) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3000/v1/api/code-run/docker/container/${selectedContainer}`);
      setAlert({
        type: 'success',
        message: 'Container deleted successfully'
      });
      setDeleteDialogOpen(false);
      fetchContainers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `Failed to delete container: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to rename a container
  const renameContainer = async () => {
    if (!selectedContainer) return;
    
    setLoading(true);
    try {
      await axios.patch(`http://localhost:3000/v1/api/code-run/docker/container/${selectedContainer}/rename`, {
        newName: newContainerName
      });
      setAlert({
        type: 'success',
        message: 'Container renamed successfully'
      });
      setRenameDialogOpen(false);
      fetchContainers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `Failed to rename container: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create new container(s)
  const onCreateSubmit = async (data: ContainerForm) => {
    setLoading(true);
    
    try {
      // Handle network creation if needed
      let networkId = null;
      if (data.createNetwork && data.networkName) {
        try {
          const networkResponse = await axios.post('http://localhost:3000/v1/api/code-run/docker/network/create', {
            Name: data.networkName
          });
          networkId = networkResponse.data.Id;
        } catch (netError: any) {
          console.error('Error creating network:', netError);
          // Continue with container creation even if network creation fails
        }
      }
      
      // Process each service
      for (const service of data.services) {
        const config: any = {
          Image: service.image,
          name: service.name || undefined,
          Cmd: service.command ? service.command.split(' ') : undefined,
          HostConfig: {}
        };
        
        // Add network if available
        if (networkId) {
          config.HostConfig.NetworkMode = data.networkName;
        }
        
        // Add port bindings if provided
        if (service.ports) {
          const portMappings = service.ports.split(',').map(p => p.trim());
          config.ExposedPorts = {};
          config.HostConfig.PortBindings = {};
          
          for (const portMapping of portMappings) {
            if (!portMapping) continue;
            const [hostPort, containerPort] = portMapping.split(':').reverse();
            const containerPortWithProto = containerPort.includes('/') 
              ? containerPort 
              : `${containerPort}/tcp`;
            
            config.ExposedPorts[containerPortWithProto] = {};
            config.HostConfig.PortBindings[containerPortWithProto] = [
              { HostPort: hostPort }
            ];
          }
        }
        
        // Add environment variables if provided
        if (service.environment) {
          config.Env = service.environment.split(',').map(env => env.trim());
        }
        
        // Add volume bindings if provided
        if (service.volumes) {
          config.HostConfig.Binds = service.volumes.split(',').map(v => v.trim());
        }
        
        // Add working directory if provided
        if (service.workdir) {
          config.WorkingDir = service.workdir;
        }
        
        // Create the container
        await axios.post('http://localhost:3000/v1/api/code-run/docker/container/create', config);
      }
      
      setAlert({
        type: 'success',
        message: `Successfully created ${data.services.length} container(s)`
      });
      setCreateDialogOpen(false);
      reset();
      fetchContainers();
      
    } catch (error: any) {
      console.error('Error creating containers:', error);
      setAlert({
        type: 'error',
        message: `Failed to create containers: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // State for rename dialog
  const [newContainerName, setNewContainerName] = useState('');
  
  // Function to open the rename dialog
  const openRenameDialog = (containerId: string) => {
    const container = containers.find(c => c.Id === containerId);
    if (container) {
      setSelectedContainer(containerId);
      setNewContainerName(container.Names[0].replace('/', ''));
      setRenameDialogOpen(true);
    }
  };
  
  // Function to handle tab changes in inspect dialog
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Function to format created date
  const formatCreatedDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  // Function to format ports
  const formatPorts = (ports: Container['Ports']) => {
    if (!ports || ports.length === 0) return 'None';
    
    return ports.map(port => {
      if (port.PublicPort) {
        return `${port.PublicPort}:${port.PrivatePort}/${port.Type}`;
      }
      return `${port.PrivatePort}/${port.Type}`;
    }).join(', ');
  };
  
  // Function to handle alert close
  const handleAlertClose = () => {
    setAlert(null);
  };

  // Filtered and sorted containers based on search and filter criteria
  const filteredContainers = useMemo(() => {
    return containers
      .filter(container => {
        // Apply status filter
        if (statusFilter !== 'all' && statusFilter !== 'other') {
          if (container.State !== statusFilter) return false;
        } else if (statusFilter === 'other') {
          if (['running', 'exited'].includes(container.State)) return false;
        }
        
        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const name = container.Names?.[0]?.replace('/', '')?.toLowerCase() || '';
          const image = container.Image?.toLowerCase() || '';
          const id = container.Id?.toLowerCase() || '';
          
          if (!name.includes(searchLower) && 
              !image.includes(searchLower) && 
              !id.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        switch(sortBy) {
          case 'created_desc':
            return b.Created - a.Created;
          case 'created_asc':
            return a.Created - b.Created;
          case 'name':
            return (a.Names?.[0] || '').localeCompare(b.Names?.[0] || '');
          default:
            return 0;
        }
      });
  }, [containers, statusFilter, searchQuery, sortBy]);

  function openTerminal(containerId: string): void {
    // Open a new window/tab to the terminal endpoint for the container
    // You may need to adjust the URL to match your backend's terminal endpoint
    const url = `http://localhost:3000/v1/api/code-run/docker/container/${containerId}/terminal`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Docker Container Management
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Create Container
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchContainers}
            disabled={loading}
          >
            Refresh List
          </Button>
        </Box>
      </Box>

      {/* Filter and search bar */}
      <Box sx={{ mb: 3 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <TextField
            placeholder="Search containers..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="exited">Stopped</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-label">Sort By</InputLabel>
            <Select
              labelId="sort-label"
              label="Sort By"
              value={sortBy}
              onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
            >
              <MenuItem value="created_desc">Newest First</MenuItem>
              <MenuItem value="created_asc">Oldest First</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Box>

      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid key={`skeleton-${item}`}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ pb: 1, flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="rounded" width={70} height={24} />
                  </Box>
                  
                  <Skeleton variant="text" sx={{ fontSize: '1.25rem', mb: 0.5 }} width="60%" />
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 2 }} width="85%" />
                  
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width="30%" />
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="70%" />
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width="30%" />
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="90%" />
                  </Box>
                  
                  <Skeleton variant="text" sx={{ fontSize: '0.75rem', mt: 1 }} width="60%" />
                  <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width="40%" />
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ p: 1, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((button) => (
                    <Skeleton key={`button-${button}`} variant="circular" width={30} height={30} sx={{ mx: 0.5 }} />
                  ))}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && filteredContainers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No containers found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {containers.length > 0 
              ? "No containers match your filter criteria" 
              : "Click 'Create Container' to add a new container"}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredContainers.map((container) => (
            <Grid key={container.Id}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}
              >
                <CardContent sx={{ pb: 1, flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      {container.Names[0]?.charAt(1)?.toUpperCase() || 'C'}
                    </Avatar>
                    
                    <Chip 
                      label={container.State}
                      color={
                        container.State === 'running' ? 'success' :
                        container.State === 'exited' ? 'error' : 
                        'default'
                      }
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h6" noWrap gutterBottom>
                    {container.Names[0]?.replace('/', '') || 'Unnamed'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                    {container.Image}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" component="div">
                      Status:
                    </Typography>
                    <Typography variant="body2">
                      {container.Status}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" component="div">
                      Ports:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {formatPorts(container.Ports)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Created: {formatCreatedDate(container.Created)}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    ID: {container.Id?.substring(0, 12)}
                  </Typography>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ p: 1, justifyContent: 'center' }}>
                  {container.State !== 'running' && (
                    <Tooltip title="Start">
                      <IconButton 
                        color="success"
                        size="small"
                        onClick={() => startContainer(container.Id)}
                      >
                        <StartIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {container.State === 'running' && (
                    <Tooltip title="Stop">
                      <IconButton 
                        color="error"
                        size="small"
                        onClick={() => stopContainer(container.Id)}
                      >
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Restart">
                    <IconButton 
                      color="primary"
                      size="small"
                      onClick={() => restartContainer(container.Id)}
                    >
                      <RestartIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {container.State === 'running' && (
                    <Tooltip title="Terminal">
                      <IconButton 
                        color="primary"
                        size="small"
                        onClick={() => openTerminal(container.Id)}
                      >
                        <TerminalIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Inspect">
                    <IconButton 
                      color="info"
                      size="small"
                      onClick={() => inspectContainer(container.Id)}
                    >
                      <InspectIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="More">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setSelectedContainer(container.Id);
                        setContainerMenuAnchor(e.currentTarget);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Container Dialog with React Hook Form */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          reset();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Container</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Network Options
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Controller
                  name="createNetwork"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <InputLabel id="my-select-label">Create Network</InputLabel>
                      <Select
                        labelId="my-select-label"
                        {...field}
                        label="Create Network"
                        size="small"
                      >
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                
                {createNetwork && (
                  <Controller
                    name="networkName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Network Name"
                        size="small"
                        error={!!errors.networkName}
                        helperText={errors.networkName?.message?.toString()}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Services
              <Button 
                variant="text" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => append({
                  name: '',
                  image: '',
                  command: '',
                  ports: '',
                  environment: '',
                  volumes: '',
                  workdir: '',
                  network: ''
                })}
                sx={{ ml: 2 }}
              >
                Add Service
              </Button>
            </Typography>
            
            {fields.map((field, index) => (
              <Box 
                key={field.id} 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  position: 'relative'
                }}
              >
                <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                  {fields.length > 1 && (
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => remove(index)}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Service #{index + 1}
                </Typography>

                <div className="row g-3">
                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Container Name (optional)"
                          fullWidth
                          margin="dense"
                          size="small"
                          error={!!errors.services?.[index]?.name}
                          helperText={errors.services?.[index]?.name?.message?.toString()}
                        />
                      )}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.image`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Image *"
                          fullWidth
                          margin="dense"
                          size="small"
                          placeholder="e.g., nginx:latest"
                          error={!!errors.services?.[index]?.image}
                          helperText={errors.services?.[index]?.image?.message?.toString()}
                        />
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.command`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Command"
                          fullWidth
                          margin="dense"
                          size="small"
                          placeholder="e.g., npm start"
                          error={!!errors.services?.[index]?.command}
                          helperText={errors.services?.[index]?.command?.message?.toString()}
                        />
                      )}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.ports`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Ports"
                          fullWidth
                          margin="dense"
                          size="small"
                          placeholder="e.g., 8080:80, 3000:3000"
                          error={!!errors.services?.[index]?.ports}
                          helperText={
                            errors.services?.[index]?.ports?.message?.toString() || 
                            "Format: hostPort:containerPort, comma separated"
                          }
                        />
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.environment`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Environment Variables"
                          fullWidth
                          margin="dense"
                          size="small"
                          placeholder="e.g., NODE_ENV=production,DEBUG=false"
                          error={!!errors.services?.[index]?.environment}
                          helperText={
                            errors.services?.[index]?.environment?.message?.toString() ||
                            "Format: KEY=value, comma separated"
                          }
                        />
                      )}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.volumes`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Volumes"
                          fullWidth
                          margin="dense"
                          size="small"
                          placeholder="e.g., ./data:/data,volume-name:/app/data"
                          error={!!errors.services?.[index]?.volumes}
                          helperText={
                            errors.services?.[index]?.volumes?.message?.toString() ||
                            "Format: hostPath:containerPath, comma separated"
                          }
                        />
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <Controller
                      name={`services.${index}.workdir`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Working Directory"
                          fullWidth
                          margin="dense"
                          size="small"
                          placeholder="e.g., /app"
                          error={!!errors.services?.[index]?.workdir}
                          helperText={errors.services?.[index]?.workdir?.message?.toString()}
                        />
                      )}
                    />
                  </div>
                </div>
              </Box>
            ))}
          </form>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCreateDialogOpen(false);
              reset();
            }} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onCreateSubmit)} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Container Dialog */}
      <Dialog 
        open={renameDialogOpen} 
        onClose={() => setRenameDialogOpen(false)}
      >
        <DialogTitle>Rename Container</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            variant="outlined"
            value={newContainerName}
            onChange={(e) => setNewContainerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={renameContainer} 
            variant="contained"
            disabled={loading || !newContainerName}
          >
            {loading ? <CircularProgress size={24} /> : "Rename"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Container Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Container</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this container? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={deleteContainer} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inspect Container Dialog */}
      <Dialog
        open={inspectDialogOpen}
        onClose={() => setInspectDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Inspect Container</DialogTitle>
        <DialogContent>
          {containerDetails && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Container Details
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>ID:</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {containerDetails.Id}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>Name:</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {containerDetails.Name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>Image:</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {containerDetails.Config.Image}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>Status:</Typography>
                      <Typography variant="body2">
                        {containerDetails.State.Status}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>Ports:</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {Object.entries(containerDetails.NetworkSettings.Ports || {}).length > 0
                          ? Object.entries(containerDetails.NetworkSettings.Ports).map(
                              ([port, bindings]: any) => {
                                return `${port} -> ${bindings.map((b: any) => `${b.HostIp}:${b.HostPort}`).join(', ')}`;
                              }
                            ).join(', ')
                          : 'None'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>Created:</Typography>
                      <Typography variant="body2">
                        {containerDetails.State?.StartedAt
                          ? new Date(containerDetails.State.StartedAt).toLocaleString()
                          : 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>Command:</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {containerDetails.Config.Cmd ? containerDetails.Config.Cmd.join(' ') : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Environment Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Environment Variables
                  </Typography>
                  {containerDetails.Config.Env && containerDetails.Config.Env.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Variable</TableCell>
                            <TableCell>Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {containerDetails.Config.Env.map((env, index) => {
                            const [key, ...valueParts] = env.split('=');
                            const value = valueParts.join('=');
                            return (
                              <TableRow key={index}>
                                <TableCell>{key}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {value}
                                    <Tooltip title="Copy">
                                      <IconButton 
                                        size="small"
                                        onClick={() => navigator.clipboard.writeText(value)}
                                      >
                                        <CopyIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">No environment variables found</Typography>
                  )}
                </Box>
              )}
              
              {/* Network Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Port Mappings
                  </Typography>
                  
                  {containerDetails.NetworkSettings.Ports && 
                   Object.keys(containerDetails.NetworkSettings.Ports).length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Container Port</TableCell>
                            <TableCell>Host IP</TableCell>
                            <TableCell>Host Port</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(containerDetails.NetworkSettings.Ports).map(
                            ([containerPort, hostBindings], index) => (
                              <TableRow key={index}>
                                <TableCell>{containerPort}</TableCell>
                                <TableCell>
                                  {hostBindings && hostBindings.length > 0
                                    ? hostBindings[0].HostIp || '0.0.0.0'
                                    : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {hostBindings && hostBindings.length > 0
                                    ? hostBindings[0].HostPort
                                    : 'N/A'}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">No port mappings found</Typography>
                  )}
                </Box>
              )}
              
              {/* Volumes Tab */}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Volume Mounts
                  </Typography>
                  
                  {containerDetails.Mounts && containerDetails.Mounts.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Destination</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {containerDetails.Mounts.map((mount, index) => (
                            <TableRow key={index}>
                              <TableCell>{mount.Type}</TableCell>
                              <TableCell>{mount.Source}</TableCell>
                              <TableCell>{mount.Destination}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">No volume mounts found</Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspectDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      {alert && (
        <Snackbar 
          open={!!alert} 
          autoHideDuration={6000} 
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleAlertClose} 
            severity={alert.type} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      )}

      {/* Context menu for container actions */}
      <Menu
        anchorEl={containerMenuAnchor}
        open={Boolean(containerMenuAnchor)}
        onClose={() => setContainerMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          if (selectedContainer) {
            openRenameDialog(selectedContainer);
          }
          setContainerMenuAnchor(null);
        }}>
          <ListItemIcon>
            <RenameIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          setContainerMenuAnchor(null);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DockerManagement;