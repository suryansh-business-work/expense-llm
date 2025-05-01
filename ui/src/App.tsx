import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import './styles/index.scss'; // Import SCSS styles
import Login from './pages/Login';
import Bots from './pages/Bots';

const App = () => {
  return (
    <Router>
      <div className="container">
        <nav>
          <ul>
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
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bots"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Bots
              </NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* You can add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
