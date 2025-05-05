// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Bots from './pages/Bots';
import BotList from './pages/bot-list/BotList';

import './styles/index.scss';
import Layout from './pages/Layout';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="bots" element={<Bots />} />
          <Route path="bot/:botId" element={<BotList />} />
          <Route path="chat/:chatId" element={<Chat />} />
          <Route path="dashboard/:dashboardId" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
