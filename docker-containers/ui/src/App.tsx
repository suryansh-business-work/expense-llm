import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ContainersPage from './pages/ContainersPage';
import CreateContainerPage from './pages/CreateContainerPage';
import TerminalPage from './pages/TerminalPage';
import AnimatePresenceWrapper from './components/layout/AnimatePresenceWrapper';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#58a6ff' : '#2962ff',
          },
          secondary: {
            main: mode === 'dark' ? '#f78166' : '#ff6d00',
          },
          error: {
            main: '#f85149',
          },
          warning: {
            main: '#d29922',
          },
          info: {
            main: '#58a6ff',
          },
          success: {
            main: '#56d364',
          },
          background: {
            default: mode === 'dark' ? '#0d1117' : '#f5f5f5',
            paper: mode === 'dark' ? '#161b22' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#c9d1d9' : '#24292f',
            secondary: mode === 'dark' ? '#8b949e' : '#57606a',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 600 },
          h2: { fontWeight: 600 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 500 },
          h5: { fontWeight: 500 },
          h6: { fontWeight: 500 },
        },
        shape: {
          borderRadius: 6,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#161b22' : '#ffffff',
                boxShadow:
                  mode === 'dark'
                    ? '0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 1px 0 rgba(0, 0, 0, 0.1)',
                color: mode === 'dark' ? '#c9d1d9' : '#24292f',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout colorMode={colorMode} />}>
            <Route index element={<HomePage />} />
            <Route path="containers" element={<ContainersPage />} />
            <Route path="create" element={<CreateContainerPage />} />
            <Route path="terminal/:id" element={<TerminalPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
