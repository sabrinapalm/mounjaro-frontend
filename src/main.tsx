import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/500.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/nunito-sans/800.css';
import '@fontsource/nunito-sans/900.css';

import App from './App.tsx';
import './index.css';
import { queryPersister } from './query/persister';
import { queryClient } from './query/queryClient';

const locale = 'en';

// biome-ignore lint/style/noNonNullAssertion: <!-- Reason --> We are sure that the element with id 'root' exists in the HTML.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 12,
      }}
    >
      <IntlProvider locale={locale}>
        <App />
      </IntlProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  </StrictMode>
);
