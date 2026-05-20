import { StrictMode } from 'react';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { TournamentProvider } from './context/TournamentContext.tsx';

import './styles/globals.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.2,
  replaysOnErrorSampleRate: 1, // always capture replay on error
  replaysSessionSampleRate: 0.05, // 5% of sessions otherwise
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      <ThemeProvider>
        <TournamentProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TournamentProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
