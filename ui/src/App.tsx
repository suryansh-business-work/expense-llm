import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import './styles/index.scss'; // Import SCSS styles

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
          </ul>
        </nav>

        <Routes>
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* You can add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
