import { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute: FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
  
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default PrivateRoute;
