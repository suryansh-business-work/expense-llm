import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Button,
  Avatar,
  Divider,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  useTheme,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import CreateAndUpdateOrganization from './CreateAndUpdateOrganization';

const API_BASE = 'http://localhost:3000/v1/api/organization';

interface Organization {
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  organizationEmail: string;
  organizationWebsite?: string;
  isOrganizationVerified: boolean;
  isOrganizationPublic: boolean;
  createdAt: string;
  [key: string]: any;
}

interface OrganizationDetailProps {
  organization: Organization;
}

const OrganizationDetail: React.FC<OrganizationDetailProps> = ({ organization }) => {
  
  return (
    <DialogContent dividers>
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12 col-md-4">
            <Avatar 
              src={organization.organizationLogo}
              alt={organization.organizationName}
              variant="rounded"
              sx={{ width: '100%', height: 200, mb: 2 }}
            >
              <BusinessIcon sx={{ fontSize: 80 }} />
            </Avatar>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Contact</Typography>
              <Stack spacing={1} mt={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{organization.organizationEmail}</Typography>
                </Box>
                {organization.organizationPhone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {typeof organization.organizationPhone === 'object' 
                        ? Object.values(organization.organizationPhone).join(', ')
                        : organization.organizationPhone}
                    </Typography>
                  </Box>
                )}
                
                {organization.organizationWebsite && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinkIcon fontSize="small" color="primary" />
                    <Typography variant="body2" component="a" href={organization.organizationWebsite} target="_blank">
                      {organization.organizationWebsite}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
              <Stack spacing={1} mt={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">Verification:</Typography>
                  <Chip 
                    size="small"
                    color={organization.isOrganizationVerified ? "success" : "default"}
                    icon={organization.isOrganizationVerified ? <CheckIcon /> : <CloseIcon />} 
                    label={organization.isOrganizationVerified ? "Verified" : "Not Verified"} 
                  />
                </Box>
                
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">Public:</Typography>
                  <Chip 
                    size="small"
                    color={organization.isOrganizationPublic ? "primary" : "default"}
                    icon={organization.isOrganizationPublic ? <PublicIcon /> : <CloseIcon />} 
                    label={organization.isOrganizationPublic ? "Public" : "Private"} 
                  />
                </Box>
                
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">Status:</Typography>
                  <Chip 
                    size="small"
                    color={organization.isOrganizationDisabled ? "error" : "success"}
                    icon={organization.isOrganizationDisabled ? <CloseIcon /> : <CheckIcon />} 
                    label={organization.isOrganizationDisabled ? "Disabled" : "Active"} 
                  />
                </Box>
              </Stack>
            </Paper>
          </div>
          
          <div className="col-12 col-md-8">
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>{organization.organizationName}</Typography>
              
              {organization.organizationInformation && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {JSON.stringify(organization.organizationInformation, null, 2)}
                </Typography>
              )}
              
              <div className="row mt-3">
                {organization.organizationEmployeeCount && (
                  <div className="col-12 col-sm-6">
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption" color="text.secondary">Employees</Typography>
                      <Typography variant="body2">{organization.organizationEmployeeCount}</Typography>
                    </Box>
                  </div>
                )}
                
                {organization.organizationCategory && (
                  <div className="col-12 col-sm-6">
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption" color="text.secondary">Category</Typography>
                      <Typography variant="body2">
                        {typeof organization.organizationCategory === 'object' 
                          ? Object.values(organization.organizationCategory).join(', ')
                          : organization.organizationCategory}
                      </Typography>
                    </Box>
                  </div>
                )}
              </div>
            </Paper>
            
            {organization.organizationAddress && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Address</Typography>
                <Typography variant="body2">
                  {typeof organization.organizationAddress === 'object' 
                    ? Object.entries(organization.organizationAddress)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                    : organization.organizationAddress}
                </Typography>
              </Paper>
            )}
            
            {organization.organizationApiKey && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">API Key</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                  >
                    Regenerate
                  </Button>
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    overflowX: 'auto'
                  }}
                >
                  {organization.organizationApiKey}
                </Box>
              </Paper>
            )}
            
            {organization.organizationRegistrationDetails && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Registration Details</Typography>
                <Typography variant="body2">
                  {typeof organization.organizationRegistrationDetails === 'object' 
                    ? Object.entries(organization.organizationRegistrationDetails)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                    : organization.organizationRegistrationDetails}
                </Typography>
              </Paper>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

// Card skeleton when loading - now more realistic
const OrganizationCardSkeleton = () => (
  <div className="col-12 col-sm-6 col-md-4 mb-4">
    <Card elevation={1} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="rounded" width={50} height={50} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" height={28} width="70%" />
            <Skeleton variant="text" height={16} width="40%" />
          </Box>
        </Box>
        <Skeleton variant="text" height={20} width="90%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="80%" sx={{ mb: 2 }} />
        
        <Box sx={{ mt: 'auto' }}>
          <Skeleton variant="rectangular" height={1} width="100%" sx={{ mb: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="rounded" width={70} height={24} />
            <Box>
              <Skeleton variant="circular" width={24} height={24} sx={{ display: 'inline-block', mx: 0.5 }} />
              <Skeleton variant="circular" width={24} height={24} sx={{ display: 'inline-block', mx: 0.5 }} />
              <Skeleton variant="circular" width={24} height={24} sx={{ display: 'inline-block', mx: 0.5 }} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </div>
);

const Organizations: React.FC = () => {
  const theme = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // New state for tracking refreshes
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editOrganization, setEditOrganization] = useState<Organization | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchOrganizations = async () => {
    // Set loading only on initial load, use refreshing for subsequent updates
    if (!refreshing) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Add a small delay to prevent race conditions with the API
      // This ensures the backend has time to process the deletion
      // await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await axios.get(`${API_BASE}/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add debugging to see what's coming from the API
      console.log("API Response:", response.data);
      
      if (response?.data) {
        // Force a new array reference to trigger React's re-render
        setOrganizations([...response.data.data]);
      } else {
        setError(response.data?.message || 'Failed to fetch organizations');
      }
    } catch (err: any) {
      console.error("Error fetching organizations:", err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      setSelectedOrganization(null); // Show loading while fetching
      setDetailsOpen(true);
      
      const response = await axios.get(`${API_BASE}/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedOrganization(response.data.data);
      } else {
        handleCloseDetails();
        setSnackbar({
          open: true,
          message: response.data.message || 'Could not retrieve organization details',
          severity: 'error'
        });
      }
    } catch (err: any) {
      handleCloseDetails();
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'An error occurred',
        severity: 'error'
      });
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrganization(null);
  };

  const handleEdit = (organization: Organization) => {
    setEditOrganization(organization);
    setCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setRefreshing(true); // Show skeleton loading during delete operation
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE}/delete/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDeleteDialogOpen(false);
      setDeleteId(null);
      
      if (response.data) {
        // First, remove the deleted item from the current state
        // This gives users immediate feedback
        const updatedOrgs = organizations.filter(org => org.organizationId !== deleteId);
        setOrganizations(updatedOrgs);
        
        setSnackbar({
          open: true,
          message: 'Organization deleted successfully',
          severity: 'success'
        });
        
        // Then fetch the updated list from the server
        await fetchOrganizations();
      } else {
        setRefreshing(false);
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to delete organization',
          severity: 'error'
        });
      }
    } catch (err: any) {
      console.error("Error deleting organization:", err);
      setRefreshing(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'An error occurred',
        severity: 'error'
      });
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDialogClose = async (refresh?: boolean) => {
    setCreateDialogOpen(false);
    setEditOrganization(null);
    if (refresh) {
      setRefreshing(true);
      await fetchOrganizations();
    }
  };

  // Determine if we should show loading state (either initial load or during refresh)
  const isLoading = loading || refreshing;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Organizations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={isLoading} // Disable button during loading
        >
          Create Organization
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <div className="container p-0">
        <div className="row g-4">
          {isLoading ? (
            // Show skeleton cards during loading or refreshing
            Array.from(new Array(6)).map((_, index) => (
              <OrganizationCardSkeleton key={index} />
            ))
          ) : organizations.length === 0 ? (
            <div className="col-12">
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.background.paper, 0.6)
                }}
              >
                <BusinessIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No organizations found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click the "Create Organization" button to add a new organization
                </Typography>
              </Paper>
            </div>
          ) : (
            organizations.map((org) => (
              <div className="col-12 col-sm-6 col-md-4 mb-4" key={org.organizationId}>
                <Card 
                  elevation={1} 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: theme.shadows[3],
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {org.isOrganizationVerified && (
                    <Tooltip title="Verified Organization">
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          backgroundColor: 'success.main',
                          color: 'white',
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Tooltip>
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={org.organizationLogo}
                        variant="rounded"
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          bgcolor: org.isOrganizationPublic ? 'primary.light' : 'grey.300',
                          mr: 2
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div" noWrap>
                          {org.organizationName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                      <Typography variant="body2" noWrap>
                        {org.organizationEmail}
                      </Typography>
                    </Box>
                    
                    {org.organizationWebsite && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LinkIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                        <Typography variant="body2" noWrap>
                          {org.organizationWebsite}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5 }}>
                    <Chip 
                      size="small" 
                      label={org.isOrganizationPublic ? 'Public' : 'Private'} 
                      color={org.isOrganizationPublic ? 'primary' : 'default'}
                      icon={org.isOrganizationPublic ? <PublicIcon /> : undefined}
                    />
                    
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(org.organizationId)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleEdit(org)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(org.organizationId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Organization Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Organization Details
          </Typography>
          <IconButton onClick={handleCloseDetails} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {selectedOrganization ? (
          <OrganizationDetail organization={selectedOrganization} />
        ) : (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          {selectedOrganization && (
            <Button 
              color="primary" 
              variant="contained"
              onClick={() => {
                handleCloseDetails();
                handleEdit(selectedOrganization);
              }}
              startIcon={<EditIcon />}
            >
              Edit Organization
            </Button>
          )}
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this organization? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={refreshing}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            disabled={refreshing}
          >
            {refreshing ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <CreateAndUpdateOrganization
        open={createDialogOpen}
        onClose={handleDialogClose}
        organization={editOrganization}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Organizations;