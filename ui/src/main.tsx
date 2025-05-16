import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { HelmetProvider, Helmet } from 'react-helmet-async'; // Import HelmetProvider
import App from './App.tsx';
import { UserProvider } from './providers/UserProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <Auth0Provider
        domain="smart-bots.us.auth0.com"
        clientId="lJseCCXyAoV3J20R2VcK61h5BjwA7ZfR"
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <HelmetProvider>
          <Helmet>
            <title>Botify your life</title>
            <link rel="canonical" href="https://www.tacobell.com/" />
          </Helmet>
          <App />
        </HelmetProvider>
      </Auth0Provider>
    </UserProvider>
  </StrictMode>,
);
