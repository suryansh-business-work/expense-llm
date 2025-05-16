import { useState } from 'react';
import { AppBar, Toolbar, Drawer } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { getBotPageByUrl } from '../../pages/data/BotPagesData';
import HeaderLogo from './HeaderLogo';
import HeaderNavLinks from './HeaderNavLinks';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderDrawer from './HeaderDrawer';

const Header = () => {
  const { botId, childBotType, chatBotId } = useParams();
  const location = useLocation();
  const botPage = getBotPageByUrl(botId || '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navLinks = [
    { to: '/bots', label: 'All Bots' },
    { to: `/bot/${childBotType}/chat/${chatBotId}`, label: 'Chat' },
    { to: `/bot/${childBotType}/dashboard/${chatBotId}`, label: 'Dashboard' },
  ];

  const pathParts = location.pathname.split('/');
  const isLinkChatOrDashboard = pathParts.includes('chat') || pathParts.includes('dashboard');

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#0c1b32' }}>
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
