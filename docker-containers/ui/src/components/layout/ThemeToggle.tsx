import React from 'react';
import { IconButton, useTheme, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  toggleColorMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ toggleColorMode }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Tooltip title={theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
        <IconButton onClick={toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>
    </motion.div>
  );
};

export default ThemeToggle;