import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Stack
} from "@mui/material";

interface LoaderSectionProps {
  type: 'header' | 'code' | 'settings';
}

const LoaderSection: React.FC<LoaderSectionProps> = ({ type }) => {
  // Render skeleton for header
  const renderSkeletonHeader = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={280} height={48} />
        </Box>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={140} height={36} />
        </Stack>
      </Box>
      
      <Box display="flex" alignItems="center" gap={2} mt={1}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="text" width={120} height={24} />
        <Skeleton variant="text" width={160} height={24} />
      </Box>
    </Box>
  );

  // Render skeleton for code editor
  const renderSkeletonCodeEditor = () => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        pb: 3,
        mb: 4
      }}
    >
      {/* Language selector skeleton */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}
      >
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="circular" width={36} height={36} />
      </Box>
      
      {/* Editor skeleton */}
      <Box sx={{ height: 500, border: '1px solid #eee' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" 
          sx={{ 
            bgcolor: 'rgba(33,33,33,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} 
        >
          <Typography variant="body1" color="text.secondary">
            Loading editor...
          </Typography>
        </Skeleton>
      </Box>
    </Paper>
  );

  // Render skeleton for tool settings
  const renderSkeletonToolSettings = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        mb: 4
      }}
    >
      <Skeleton variant="text" width={180} height={32} sx={{ mb: 3 }} />
      
      {/* Basic Information skeletons */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <Skeleton variant="rounded" height={80} />
        </div>
        <div className="col-12">
          <Skeleton variant="rounded" height={120} />
        </div>
      </div>
      
      <Box mt={4} mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={120} height={32} />
        <Skeleton variant="rounded" width={150} height={36} />
      </Box>
      
      {/* Parameters skeletons */}
      {[1, 2].map((_, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: '1px solid #eee',
            borderRadius: 2
          }}
        >
          <div className="row g-2 align-items-start">
            <div className="col-12 col-md-3">
              <Skeleton variant="rounded" height={40} />
            </div>
            <div className="col-12 col-md-2">
              <Skeleton variant="rounded" height={40} />
            </div>
            <div className="col-12 col-md-4">
              <Skeleton variant="rounded" height={40} />
            </div>
            <div className="col-6 col-md-2">
              <Skeleton variant="rounded" height={40} />
            </div>
            <div className="col-6 col-md-1 d-flex justify-content-center align-items-center">
              <Skeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        </Paper>
      ))}
    </Paper>
  );

  // Return the appropriate skeleton based on type
  switch (type) {
    case 'header':
      return renderSkeletonHeader();
    case 'code':
      return renderSkeletonCodeEditor();
    case 'settings':
      return renderSkeletonToolSettings();
    default:
      return null;
  }
};

export default LoaderSection;