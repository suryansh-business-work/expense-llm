// App.tsx
import './styles/index.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Bots from './pages/bot-pages/Bots';
import BotList from './pages/bot-pages/ChildBots';
import ProtectedRoute, { UnprotectedRoute } from './components/ProtectedRoute';
import ForgotPassword from './pages/auth-pages/ForgotPassword';
import Profile from './pages/user-pages/Profile';
import Layout from './pages/layouts/Layout';
import NotFound from './pages/NotFound';
import Signup from './pages/auth-pages/Signup';
import NoHeaderLayout from './pages/layouts/NoHeaderLayout';
import Login from './pages/auth-pages/Login';
import ManageSubscription from './pages/user-pages/ManageSubscription';
import Integrations from './pages/integrations/Integrations';
import Settings from './pages/user-pages/Settings';

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
          <Route path="/settings" element={<Settings />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/manage-subcription" element={<ManageSubscription />} />
          <Route path="bots" element={<Bots />} />
          <Route path="bot/:childBotType" element={<BotList />} />
          <Route path="bot/:childBotType/chat/:chatBotId" element={<Chat />} />
          <Route path="bot/:childBotType/dashboard/:chatBotId" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
