import { useState } from 'react';
import { AppBar, Toolbar, Drawer } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { getBotPageByUrl } from '../../pages/data/BotPagesData';
import HeaderLogo from './HeaderLogo';
import HeaderNavLinks from './HeaderNavLinks';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderDrawer from './HeaderDrawer';
import HeaderAlert from './HeaderAlert';
// import { useAppTheme } from '../../pages/admin/design-system/ThemeProvider';

const Header = () => {
  const { childBotType, chatBotId } = useParams();
  const location = useLocation();
  const botPage = getBotPageByUrl(childBotType || '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const appTheme = useAppTheme();

  const navLinks = [
    { to: '/bots', label: 'All Bots' },
    { to: `/bot/${childBotType}/chat/${chatBotId}`, label: 'Chat' },
    { to: `/bot/${childBotType}/chat-settings/${chatBotId}`, label: 'Settings' },
    { to: `/bot/${childBotType}/lab/${chatBotId}`, label: 'Lab' }
  ];
  const pathParts = location.pathname.split('/');
  const isLinkChatOrDashboard = pathParts.includes('chat') || pathParts.includes('chat-settings')|| pathParts.includes('lab');

  return (
    <>
      <HeaderAlert />
      <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#000' }}>
        <Toolbar>
          <div className="container-fluid">
            <div className="row align-items-center w-100">
              <HeaderLogo isMobile={isMobile} setDrawerOpen={setDrawerOpen} />
              <HeaderNavLinks
                isMobile={isMobile}
                isLinkChatOrDashboard={isLinkChatOrDashboard}
                navLinks={navLinks}
                botPage={botPage}
              />
              <HeaderUserMenu />
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <HeaderDrawer
          navLinks={navLinks}
          isLinkChatOrDashboard={isLinkChatOrDashboard}
          setDrawerOpen={setDrawerOpen}
        />
      </Drawer>
    </>
  );
};

export default Header;
