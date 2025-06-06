import React from 'react';
import {
  Box,
  Button,
  Breadcrumbs as MuiBreadcrumbs,
  Typography,
  Link,
  SxProps,
  Theme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string; // Optional - if missing, it's the current page (active)
}

interface DynamicBreadcrumbProps {
  items: BreadcrumbItem[]; // Array of breadcrumb items
  backPath?: string; // Where back button navigates to
  showBack?: boolean; // Whether to show back button
  backLabel?: string; // Text for back button
  containerSx?: SxProps<Theme>; // Custom styles for container
  breadcrumbSx?: SxProps<Theme>; // Custom styles for breadcrumbs
}

const DynamicBreadcrumb: React.FC<DynamicBreadcrumbProps> = ({
  items,
  backPath = '/',
  showBack = true,
  backLabel = 'Back',
  containerSx = {},
  breadcrumbSx = {}
}) => {
  const navigate = useNavigate();

  // Default container styles
  const defaultContainerSx = {
    background: "#fff",
    borderRadius: 2,
    px: { xs: 1, md: 2 },
    py: 1.5,
    boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
    gap: 2,
    mb: 3,
    display: "flex",
    alignItems: "center",
  };

  // Default breadcrumb styles
  const defaultBreadcrumbSx = { 
    fontSize: 16 
  };

  // Combine default and custom styles
  const combinedContainerSx = { ...defaultContainerSx, ...containerSx };
  const combinedBreadcrumbSx = { ...defaultBreadcrumbSx, ...breadcrumbSx };

  return (
    <Box sx={combinedContainerSx}>
      {showBack && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backPath)}
          sx={{
            mr: 2,
            background: "#e3eafc",
            color: "#1976d2",
            fontWeight: 500,
            borderRadius: 2,
            px: 2,
            boxShadow: "none",
            "&:hover": { background: "#d2e3fc" },
            minWidth: 90,
          }}
          variant="contained"
          aria-label="Back"
        >
          {backLabel}
        </Button>
      )}
      <MuiBreadcrumbs aria-label="breadcrumb" sx={combinedBreadcrumbSx}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast) {
            // Current/last item (not clickable)
            return (
              <Typography key={index} color="text.primary" sx={{ fontWeight: 600 }}>
                {item.label}
              </Typography>
            );
          } else if (item.path) {
            // Clickable item with path
            return (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                onClick={() => navigate(item.path!)}
                sx={{ cursor: 'pointer', fontWeight: 500 }}
              >
                {item.label}
              </Link>
            );
          } else {
            // Non-clickable item without path
            return (
              <Typography key={index} color="text.secondary" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
            );
          }
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default DynamicBreadcrumb;