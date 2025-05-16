import { Typography, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

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
}) => (
  <div className="col">
    <div className="d-flex align-items-center">
      {botPage && (
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginRight: '20px' }}>
          {botPage.botListPage.heading}
        </Typography>
      )}
      {!isMobile && isLinkChatOrDashboard &&
        navLinks.slice(1).map((link) => (
          <NavLink key={link.to} to={link.to}>
            {({ isActive }) => (
              <Button
                sx={{
                  marginRight: '20px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: '#fff'
                }}
                variant={isActive ? 'contained' : 'text'}
              >
                {link.label}
              </Button>
            )}
          </NavLink>
        ))}
    </div>
  </div>
);

export default HeaderNavLinks;