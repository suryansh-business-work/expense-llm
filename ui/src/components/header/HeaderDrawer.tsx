import { Box, List, ListItem, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material';

const HeaderDrawer = ({
  navLinks,
  isLinkChatOrDashboard,
  setDrawerOpen,
}: {
  navLinks: { to: string; label: string }[];
  isLinkChatOrDashboard: boolean;
  setDrawerOpen: (open: boolean) => void;
}) => {
  const theme = useTheme();
  return (
    <Box onClick={() => setDrawerOpen(false)} sx={{ width: 250 }}>
      <List>
        <ListItem
          key="/bots"
          component={NavLink}
          to="/bots"
          sx={{
            '&.active': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <ListItemText primary="All Bots" />
        </ListItem>
        {isLinkChatOrDashboard &&
          navLinks.slice(1).map((link) => (
            <ListItem
              key={link.to}
              component={NavLink}
              to={link.to}
              sx={{
                '&.active': {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default HeaderDrawer;