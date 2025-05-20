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
        <GoogleOAuthProvider clientId="508129946567-ohklo0ttnkjnv1lbumjuugsljeudpltu.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </DynamicSnackbarProvider>
    </UserProvider>
  </StrictMode>,
);
