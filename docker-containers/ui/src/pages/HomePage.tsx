import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Card, CardContent, 
  CardActions, useTheme, Divider
} from '@mui/material';
import { 
  ViewList as ViewListIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Terminal as TerminalIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getContainers, Container } from '../services/api';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setLoading(true);
        const data = await getContainers();
        setContainers(data);
      } catch (error) {
        console.error('Error fetching containers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContainers();
  }, []);
  
  const runningContainers = containers.filter(c => c.status === 'running').length;
  const stoppedContainers = containers.filter(c => c.status !== 'running').length;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Docker Container Manager
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create, manage, and interact with Docker containers through an intuitive interface.
          </Typography>
        </motion.div>
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper 
              elevation={0}
              variant="outlined"
              sx={{ 
                p: 3, 
                borderRadius: 1,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(to right, rgba(88, 166, 255, 0.1), rgba(88, 166, 255, 0.05))'
                  : 'linear-gradient(to right, rgba(41, 98, 255, 0.1), rgba(41, 98, 255, 0.05))'
              }}
            >
              <Grid container spacing={3}>
                <Grid>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2
                  }}>
                    <StorageIcon sx={{ 
                      fontSize: 48, 
                      color: theme.palette.primary.main,
                      mr: 2
                    }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {containers.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Containers
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2
                  }}>
                    <PlayIcon sx={{ 
                      fontSize: 48, 
                      color: theme.palette.success.main,
                      mr: 2
                    }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {runningContainers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Running Containers
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2
                  }}>
                    <Box 
                      sx={{ 
                        fontSize: 48, 
                        color: theme.palette.error.main,
                        mr: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 48,
                        height: 48
                      }}
                    >
                      ■
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stoppedContainers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stopped Containers
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Quick Actions */}
        <Grid>
          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show"
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 2 }}>
              Quick Actions
            </Typography>

            <Grid container spacing={3}>
              <Grid>
                <motion.div variants={item}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 8px 16px rgba(0,0,0,0.4)'
                          : '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <ViewListIcon 
                          sx={{ 
                            fontSize: 32, 
                            color: theme.palette.primary.main
                          }} 
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        View Containers
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        See all your Docker containers and their status.
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button onClick={() => navigate('/containers')} size="small">
                        Go to Containers
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid>
                <motion.div variants={item}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 8px 16px rgba(0,0,0,0.4)'
                          : '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <AddIcon 
                          sx={{ 
                            fontSize: 32, 
                            color: theme.palette.success.main
                          }} 
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        Create Container
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create a new Docker container with your settings.
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button onClick={() => navigate('/create')} size="small">
                        Create New
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid>
                <motion.div variants={item}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 8px 16px rgba(0,0,0,0.4)'
                          : '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <TerminalIcon 
                          sx={{ 
                            fontSize: 32, 
                            color: theme.palette.warning.main
                          }} 
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        Terminal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Execute commands in a container terminal.
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button onClick={() => navigate('/containers')} size="small">
                        Select Container
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
              
              {/* Recent Container */}
              <Grid>
                <motion.div variants={item}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 8px 16px rgba(0,0,0,0.4)'
                          : '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <StorageIcon 
                          sx={{ 
                            fontSize: 32, 
                            color: theme.palette.info.main
                          }} 
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        Recent Container
                      </Typography>
                      {containers.length > 0 ? (
                        <>
                          <Typography variant="body2" gutterBottom>
                            <strong>{containers[0]?.name || containers[0]?.id.substring(0, 12)}</strong>
                          </Typography>
                          <Box sx={{ 
                            display: 'inline-block', 
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: containers[0]?.status === 'running' 
                              ? `${theme.palette.success.main}20`
                              : `${theme.palette.error.main}20`,
                            color: containers[0]?.status === 'running' 
                              ? theme.palette.success.main
                              : theme.palette.error.main
                          }}>
                            {containers[0]?.status}
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No containers found.
                        </Typography>
                      )}
                    </CardContent>
                    <Divider />
                    <CardActions>
                      {containers.length > 0 && (
                        <Button onClick={() => navigate(`/terminal/${containers[0].id}`)} size="small">
                          Open Terminal
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;