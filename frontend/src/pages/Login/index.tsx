import { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const LoginPage: FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Typography variant="h5">Login</Typography>
    </Box>
  );
};

export default LoginPage;
