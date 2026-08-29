import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router/AppRouter';
import '@/styles/brand-tokens.css';
import '@/shared/styles/index.css';
import '@/app/styles/admin-theme.css';

export const App = () => (
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
);

export default App;