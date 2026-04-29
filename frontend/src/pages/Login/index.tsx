import { FC, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Stack from '@mui/material/Stack';

const LoginPage: FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: { xs: 3, sm: 5 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Logo + título */}
        <Stack spacing={0.5} sx={{ mb: 4, alignItems: 'center' }}>
          <Typography
            variant="h3"
            color="primary"
            sx={{ fontWeight: 800, letterSpacing: '0.12em' }}
          >
            PDV
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Bem-vindo
          </Typography>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={2.5}>
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            autoFocus
          />

          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      size="small"
                      sx={{ color: 'text.secondary', mr: 0.5 }}
                    >
                      {showPassword
                        ? <VisibilityOffIcon fontSize="small" />
                        : <VisibilityIcon fontSize="small" />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button variant="contained" size="large" fullWidth sx={{ mt: 1 }}>
            Entrar
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;
