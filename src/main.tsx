import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/500.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/nunito-sans/800.css';
import '@fontsource/nunito-sans/900.css';
import './index.css';
import App from './App.tsx';

// biome-ignore lint/style/noNonNullAssertion: <!-- Reason --> We are sure that the element with id 'root' exists in the HTML.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
