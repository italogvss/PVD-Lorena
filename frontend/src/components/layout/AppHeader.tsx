import { FC } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../hooks/useAuth';

interface AppHeaderProps {
  title?: string;
}

const AppHeader: FC<AppHeaderProps> = ({ title = 'PDV' }) => {
  const { logout } = useAuth();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary' }}>
          {title}
        </Typography>
        <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary' }}>
          Sair
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
