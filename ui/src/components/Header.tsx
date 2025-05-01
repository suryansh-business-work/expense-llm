import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="main-header">
      <nav>
        <NavLink
          to="/bots"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {/* <i className="fa-solid fa-left-long"></i> */}
          <span>All Bots</span>
        </NavLink>
        <ul className="nav-list">
          <li>
            <NavLink
              to="/chat/1"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Chat
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/1"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Dashboard
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
