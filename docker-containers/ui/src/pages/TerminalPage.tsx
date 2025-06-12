import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import XTerminal from '../components/terminal/XTerminal';
import { getContainer, Container } from '../services/api';

const TerminalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchContainer = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getContainer(id);
        setContainer(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching container:', error);
        setError('Failed to fetch container details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContainer();
  }, [id]);
  
  if (!id) {
    return (
      <Alert severity="error">
        No container ID provided. Please select a container.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Dashboard
          </MuiLink>
          <MuiLink color="inherit" onClick={() => navigate('/containers')} sx={{ cursor: 'pointer' }}>
            Containers
          </MuiLink>
          <Typography color="text.primary">Terminal</Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Terminal
          </Typography>
          {loading ? (
            <Typography variant="body2" color="textSecondary">
              Loading container details...
            </Typography>
          ) : container ? (
            <Typography variant="body2" color="textSecondary">
              {container.name} ({id.substring(0, 12)}) - {container.status}
            </Typography>
          ) : (
            <Typography variant="body2" color="error">
              Container not found
            </Typography>
          )}
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/containers')}
        >
          Back to Containers
        </Button>
      </Box>
      
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : container && container.status !== 'running' ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This container is not running. The terminal may not function properly.
        </Alert>
      ) : null}
      
      <Paper elevation={3} sx={{ p: 0, borderRadius: 1, overflow: 'hidden', height: '100%' }}>
        <XTerminal containerId={id} />
      </Paper>
    </Box>
  );
};

export default TerminalPage;