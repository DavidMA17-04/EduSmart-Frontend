import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router/AppRouter';
import { ToastProvider } from '@/shared/ui';
import '@/styles/brand-tokens.css';
import '@/shared/styles/index.css';
import '@/app/styles/admin-theme.css';

export const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </BrowserRouter>
);

export default App;
