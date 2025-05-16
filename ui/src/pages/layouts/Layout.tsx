// Layout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../../components/header/Header';

const Layout = () => {
  return (
    <div className='app-container'>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
