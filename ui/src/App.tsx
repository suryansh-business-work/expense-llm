// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import BotList from './pages/bot-list/BotList';
import ProtectedRoute, { UnprotectedRoute } from './components/ProtectedRoute';
import ForgotPassword from './pages/auth-pages/ForgotPassword';
import Profile from './pages/user-pages/Profile';

import './styles/index.scss';
import Layout from './pages/Layout';
import NotFound from './pages/NotFound';
import Signup from './pages/auth-pages/Signup';
import NoHeaderLayout from './pages/NoHeaderLayout';
import Login from './pages/auth-pages/Login';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NoHeaderLayout />}>
          <Route
            path="signup"
            element={
              <UnprotectedRoute>
                <Signup />
              </UnprotectedRoute>
            }
          />
          <Route
            path="login"
            element={
              <UnprotectedRoute>
                <Login />
              </UnprotectedRoute>
            }
          />
          <Route
            path="forgot-password"
            element={
              <UnprotectedRoute>
                <ForgotPassword />
              </UnprotectedRoute>
            }
          />
        </Route>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="bots" element={<Bots />} />
          <Route path="bot/:botId" element={<BotList />} />
          <Route path="bot/:botId/chat/:chatBot/:chatId" element={<Chat />} />
          <Route path="bot/:botId/dashboard/:chatBot/:chatId" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
