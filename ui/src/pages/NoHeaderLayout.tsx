// Layout.tsx
import { Outlet } from 'react-router-dom';

const NoHeaderLayout = () => {
  return (
    <div className='app-container'>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NoHeaderLayout;
