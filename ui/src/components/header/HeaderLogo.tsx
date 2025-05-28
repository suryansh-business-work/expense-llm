import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';

const HeaderLogo = ({ isMobile, setDrawerOpen }: { isMobile: boolean, setDrawerOpen: (open: boolean) => void }) => (
  <>
    {isMobile && (
      <div className="col-auto">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      </div>
    )}
    <div className="col-auto">
      <div className="logo">
        <NavLink to="/bots">
          <img src="/logo/botify-logo-dark.svg" alt="Botify Your Life" />
        </NavLink>
      </div>
    </div>
  </>
);

export default HeaderLogo;