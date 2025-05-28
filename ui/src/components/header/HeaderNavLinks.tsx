import { Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';

const HeaderNavLinks = ({
  isMobile,
  isLinkChatOrDashboard,
  navLinks,
  botPage,
}: {
  isMobile: boolean;
  isLinkChatOrDashboard: boolean;
  navLinks: { to: string; label: string }[];
  botPage: any;
}) => {
  const location = useLocation();
  const current = navLinks.find((link) => location.pathname.startsWith(link.to))?.to || navLinks[0]?.to;

  return (
    <div className="col">
      <div className="d-flex align-items-center">
        {!isMobile && isLinkChatOrDashboard && (
          <ToggleButtonGroup value={current} exclusive sx={{ background: 'transparent', ml: 1 }}>
            {navLinks.slice(1).map((link) => (
              <ToggleButton
                key={link.to}
                value={link.to}
                component={NavLink}
                to={link.to}
                sx={{
                  fontWeight: location.pathname.startsWith(link.to) ? 'bold' : 'normal',
                  padding: '8px 26px',
                  color: '#000',
                  textTransform: 'none', // <-- normal case
                  '&.Mui-selected': {
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#115293',
                      color: '#fff',
                    },
                  },
                }}
              >
                {link.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {botPage && (
          <Typography variant="h5" sx={{ marginLeft: '20px' }}>
            {botPage.botListPage.heading}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default HeaderNavLinks;