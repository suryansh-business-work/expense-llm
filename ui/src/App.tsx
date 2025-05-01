import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import './styles/index.scss'; // Import SCSS styles
import Login from './pages/Login';
import Bots from './pages/Bots';
import Header from './components/Header';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/bots" element={<Bots />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        <Route path="/dashboard/:dashboardId" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
