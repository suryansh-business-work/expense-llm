import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, IconButton, Button, Tooltip,
  FormControlLabel, Switch, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton,
  useTheme, alpha
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  RestartAlt as RestartIcon,
  Terminal as TerminalIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Folder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getContainers, startContainer, stopContainer, deleteContainer, restartContainer, Container } from '../../services/api';
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
    // Optionally, you can add polling here for real-time updates
    // const intervalId = setInterval(fetchContainers, 10000);
    // return () => clearInterval(intervalId);
  }, []);

  const handleStartContainer = async (id: string) => {
    try {
      setActionInProgress(id);
      await startContainer(id);
      await fetchContainers();
    } catch (error) {
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
      setError(`Failed to delete container ${id.substring(0, 12)}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const openFileSystem = (id: string) => {
    navigate(`/file-system/${id}`);
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

  const filteredContainers = showAll
    ? containers
    : containers.filter(c => c.status === 'running');

  return (
    <Box sx={{ width: '100%', maxWidth: 1300, mx: 'auto', p: { xs: 1, sm: 3 } }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme => theme.shadows[2],
          mb: 3,
        }}
      >
        <Box sx={{
          px: 3,
          py: 1,
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

        {error && (
          <Alert severity="error" sx={{ mb: 3, mx: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell>Name</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Ports</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={6}>
                      <Skeleton variant="rectangular" height={40} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredContainers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No containers found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContainers.map((container) => {
                  const isActionActive = actionInProgress === container.id;
                  return (
                    <TableRow
                      key={container.id}
                      hover
                      sx={{
                        transition: 'background 0.2s',
                        '&:hover': {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {container.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {container.id.substring(0, 12)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{container.image}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '12px',
                            px: 1,
                            py: 0.5,
                            backgroundColor: `${getStatusColor(container.status)}20`,
                            width: 'fit-content'
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(container.status),
                              mr: 1
                            }}
                          />
                          <Typography variant="body2" sx={{ color: getStatusColor(container.status), fontWeight: 500 }}>
                            {container.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(container.created)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {container.ports && container.ports.length > 0 ? (
                          container.ports.map((port, idx) => (
                            <Typography key={idx} variant="caption" display="block">
                              {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort}
                              ({port.type})
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="caption">No ports</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {container.status === 'running' ? (
                            <Tooltip title="Stop">
                              <span>
                                <IconButton
                                  color="warning"
                                  onClick={() => handleStopContainer(container.id)}
                                  disabled={isActionActive}
                                  size="small"
                                >
                                  {isActionActive ?
                                    <CircularProgress size={20} /> : <StopIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Start">
                              <span>
                                <IconButton
                                  color="success"
                                  onClick={() => handleStartContainer(container.id)}
                                  disabled={isActionActive}
                                  size="small"
                                >
                                  {isActionActive ?
                                    <CircularProgress size={20} /> : <PlayIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

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

                          <Tooltip title="Terminal">
                            <span>
                              <IconButton
                                onClick={() => openTerminal(container.id)}
                                size="small"
                              >
                                <TerminalIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Open File Manager">
                            <span>
                              <IconButton
                                onClick={() => openFileSystem(container.id)}
                                size="small"
                              >
                                <Folder fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <span>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteContainer(container.id)}
                                disabled={isActionActive}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ContainerList;