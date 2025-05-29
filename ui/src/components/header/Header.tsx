import { AppBar, Toolbar } from '@mui/material';
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
          <div className="container-fluid">
            <div className="row align-items-center w-100 justify-content-between">
              <HeaderLogo />
              <HeaderUserMenu />
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
