import { type FC } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRouter from './router';
import ThemeModeProvider from './theme/Theme';

const App: FC = () => (
  <ThemeModeProvider>
    <CssBaseline />
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  </ThemeModeProvider>
);

export default App;
