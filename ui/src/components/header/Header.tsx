import { AppBar, Toolbar, Box } from '@mui/material';
import HeaderLogo from './HeaderLogo';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderAlert from './HeaderAlert';
// import { useAppTheme } from '../../pages/admin/design-system/ThemeProvider';

const Header = () => {
  // const appTheme = useAppTheme();

  return (
    <>
      <HeaderAlert />
      <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#000' }}>
        <Toolbar>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <HeaderLogo />
            <HeaderUserMenu />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
