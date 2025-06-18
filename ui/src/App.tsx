import './styles/index.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import UsersList from './pages/admin/UsersList';
import ThemeManagement from './pages/admin/design-system/ComponentList';
import McpServers from './pages/mcp-servers/McpServers';
import YourMcpServerManagement from './pages/mcp-servers/YourMcpServerManagement';
import McpServerDetailsPage from './pages/mcp-servers/McpServerDetailsPage';
import ToolLaboratory from './pages/mcp-servers/tool-management/tool-laboratory/ToolLaboratory';
import DockerManagement from './pages/admin/DockerManagement';
import Organizations from './pages/organization/Organizations';
import AgenticAi from './pages/agentic-ai/AgenticAi';
import ManageCredentials from './components/ManageCredentials';

const Chat = lazy(() => import('./pages/chat/Chat'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bots = lazy(() => import('./pages/bot-pages/bots/Bots'));
const BotList = lazy(() => import('./pages/bot-pages/child-bots/ChildBots'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const UnprotectedRoute = lazy(() => import('./components/ProtectedRoute').then(m => ({ default: m.UnprotectedRoute })));
const ForgotPassword = lazy(() => import('./pages/auth-pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/user-pages/profile/Profile'));
const Layout = lazy(() => import('./pages/layouts/Layout'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Signup = lazy(() => import('./pages/auth-pages/Signup'));
const NoHeaderLayout = lazy(() => import('./pages/layouts/NoHeaderLayout'));
const ManageSubscription = lazy(() => import('./pages/user-pages/ManageSubscription'));
const Integrations = lazy(() => import('./pages/integrations/Integrations'));
const Settings = lazy(() => import('./pages/user-pages/Settings'));
const ChatSettings = lazy(() => import('./pages/chat/chat-settings/ChatSettings'));
const ChatLab = lazy(() => import('./pages/chat/chat-settings/lab/ChatLab'));
const Login = lazy(() => import('./pages/auth-pages/Login'));

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
          <Route path="bots/:childBotType" element={<BotList />} />
          <Route path="bot/:childBotType/chat/:chatBotId" element={<Chat />} />
          <Route path="bot/:childBotType/dashboard/:chatBotId" element={<Dashboard />} />
          <Route path="bot/:childBotType/chat-settings/:chatBotId" element={<ChatSettings />} />
          <Route path="bot/:childBotType/lab/:chatBotId" element={<ChatLab />} />
          <Route path="lab/mcp-servers/:servers" element={<McpServers />} />
          <Route path="lab/mcp-server/:mcpServerId" element={<McpServerDetailsPage />} />
          <Route path="lab/mcp-server/your-server/:mcpServerId" element={<YourMcpServerManagement />} />
          <Route path="lab/mcp-server/your-server/:mcpServerId/tool/:toolId" element={<ToolLaboratory />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="profile" element={<Profile />} />
          <Route path="lab/agentic-ai" element={<AgenticAi />} />
          <Route path="/manage-credentials" element={<ManageCredentials />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="theme-management" element={<ThemeManagement />} />
          <Route path="docker-management" element={<DockerManagement />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
