import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Button, Tooltip, 
  FormControlLabel, Switch, CircularProgress, Alert,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  PlayArrow as PlayIcon, 
  Stop as StopIcon, 
  Delete as DeleteIcon,
  RestartAlt as RestartIcon,
  Terminal as TerminalIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getContainers, startContainer, stopContainer, deleteContainer, restartContainer, Container } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ContainerList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  const fetchContainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContainers();
      setContainers(data);
    } catch (error) {
      console.error('Error fetching containers:', error);
      setError('Failed to fetch containers. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContainers();
    
    const intervalId = setInterval(fetchContainers, 10000);
    return () => clearInterval(intervalId);
  }, []);
  
  const handleStartContainer = async (id: string) => {
    try {
      setActionInProgress(id);
      await startContainer(id);
      await fetchContainers();
    } catch (error) {
      console.error('Error starting container:', error);
      setError(`Failed to start container ${id.substring(0, 12)}`);
    } finally {
      setActionInProgress(null);
    }
  };
  
  const handleStopContainer = async (id: string) => {
    try {
      setActionInProgress(id);
      await stopContainer(id);
      await fetchContainers();
    } catch (error) {
      console.error('Error stopping container:', error);
      setError(`Failed to stop container ${id.substring(0, 12)}`);
    } finally {
      setActionInProgress(null);
    }
  };
  
  const handleRestartContainer = async (id: string) => {
    try {
      setActionInProgress(id);
      await restartContainer(id);
      await fetchContainers();
    } catch (error) {
      console.error('Error restarting container:', error);
      setError(`Failed to restart container ${id.substring(0, 12)}`);
    } finally {
      setActionInProgress(null);
    }
  };
  
  const handleDeleteContainer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this container?')) {
      return;
    }
    
    try {
      setActionInProgress(id);
      await deleteContainer(id);
      await fetchContainers();
    } catch (error) {
      console.error('Error deleting container:', error);
      setError(`Failed to delete container ${id.substring(0, 12)}`);
    } finally {
      setActionInProgress(null);
    }
  };
  
  const openTerminal = (id: string) => {
    navigate(`/terminal/${id}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return theme.palette.success.main;
      case 'created':
        return theme.palette.info.main;
      case 'exited':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy HH:mm:ss');
  };
  
  const renderStatus = (params: GridRenderCellParams) => {
    const status = params.value as string;
    return (
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          borderRadius: '12px',
          px: 1,
          py: 0.5,
          backgroundColor: `${getStatusColor(status)}20`,
          width: 'fit-content'
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStatusColor(status),
            mr: 1
          }}
        />
        <Typography variant="body2" sx={{ color: getStatusColor(status), fontWeight: 500 }}>
          {status}
        </Typography>
      </Box>
    );
  };
  
  const renderActions = (params: GridRenderCellParams) => {
    const container = params.row as Container;
    const isActionActive = actionInProgress === container.id;
    
    return (
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {container.status === 'running' ? (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Tooltip title="Stop">
              <IconButton 
                color="warning"
                onClick={() => handleStopContainer(container.id)}
                disabled={isActionActive}
                size="small"
              >
                {isActionActive ? 
                  <CircularProgress size={20} /> : <StopIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Tooltip title="Start">
              <IconButton 
                color="success"
                onClick={() => handleStartContainer(container.id)}
                disabled={isActionActive}
                size="small"
              >
                {isActionActive ? 
                  <CircularProgress size={20} /> : <PlayIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </motion.div>
        )}
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Tooltip title="Restart">
            <span>
              <IconButton 
                color="info"
                onClick={() => handleRestartContainer(container.id)}
                disabled={isActionActive || container.status !== 'running'}
                size="small"
              >
                <RestartIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Tooltip title="Terminal">
            <IconButton 
              onClick={() => openTerminal(container.id)}
              size="small"
            >
              <TerminalIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Tooltip title="Delete">
            <IconButton 
              color="error"
              onClick={() => handleDeleteContainer(container.id)}
              disabled={isActionActive}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </motion.div>
      </Box>
    );
  };
  
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.id.substring(0, 12)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'image',
      headerName: 'Image',
      flex: 1.5,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: renderStatus
    },
    {
      field: 'created',
      headerName: 'Created',
      flex: 1.5,
      valueFormatter: (params: { value: number }) => {
        if (params.value != null) {
          return formatDate(params.value as number);
        }
        return '';
      }
    },
    {
      field: 'ports',
      headerName: 'Ports',
      flex: 1.5,
      renderCell: (params) => {
        const ports = params.value as Array<{privatePort: number, publicPort?: number, type: string}>;
        if (!ports || ports.length === 0) return <Typography variant="caption">No ports</Typography>;
        
        return (
          <Box>
            {ports.map((port, idx) => (
              <Typography key={idx} variant="caption" display="block">
                {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort} 
                ({port.type})
              </Typography>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: renderActions
    },
  ];
  
  const filteredContainers = showAll 
    ? containers 
    : containers.filter(c => c.status === 'running');
  
  return (
    <Box width={1300} mx="auto" sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <FormControlLabel 
              control={
                <Switch 
                  checked={showAll} 
                  onChange={(e) => setShowAll(e.target.checked)} 
                  color="primary"
                />
              } 
              label="Show all containers (including stopped)" 
            />
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchContainers}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper 
          elevation={0}
          variant="outlined"
          sx={{ 
            width: '100%', 
            overflow: 'hidden',
            borderRadius: 1,
            height: 600
          }}
        >
          <DataGrid
            rows={filteredContainers}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            autoPageSize
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600
              },
              '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
                outline: 'none !important',
              },
              '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus': {
                outline: 'none !important',
              }
            }}
          />
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ContainerList;