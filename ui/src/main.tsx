import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider, Helmet } from 'react-helmet-async'; // Import HelmetProvider
import App from './App.tsx';
import { UserProvider } from './providers/UserProvider.tsx';
import { DynamicSnackbarProvider } from './hooks/useDynamicSnackbar.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <DynamicSnackbarProvider>
        <HelmetProvider>
          <Helmet>
            <title>Botify your life</title>
            <link rel="canonical" href="https://www.tacobell.com/" />
          </Helmet>
          <App />
        </HelmetProvider>
      </DynamicSnackbarProvider>
    </UserProvider>
  </StrictMode>,
);
