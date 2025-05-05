import { NavLink, useParams } from 'react-router-dom';
import { getBotPageByUrl } from '../pages/BotPagesData';

const Header = () => {
  const { botId } = useParams<{ botId: string }>();
  const botPage = getBotPageByUrl(botId || '');

  return (
    <header className="main-header">
      <nav>
        <NavLink
          to="/bots"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span>All Bots</span>
        </NavLink>
        {botPage && (
          <span style={{ marginLeft: '1rem', fontWeight: 'bold' }}>
            {botPage.botListPage.heading}
          </span>
        )}
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
