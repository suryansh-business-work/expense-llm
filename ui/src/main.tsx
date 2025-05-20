import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './providers/UserProvider.tsx';
import { DynamicSnackbarProvider } from './hooks/useDynamicSnackbar.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <DynamicSnackbarProvider>
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          <App />
        </GoogleOAuthProvider>
      </DynamicSnackbarProvider>
    </UserProvider>
  </StrictMode>,
);
