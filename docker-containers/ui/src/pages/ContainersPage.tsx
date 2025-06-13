import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import ContainerList from '../components/containers/ContainerList';

const ContainersPage: React.FC = () => (
  <Box sx={{ width: '100%', maxWidth: 1300, mx: 'auto', p: { xs: 1, sm: 3 } }}>
    <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>
      Containers
    </Typography>
    <Divider sx={{ mb: 3 }} />
    <ContainerList />
  </Box>
);

export default ContainersPage;
