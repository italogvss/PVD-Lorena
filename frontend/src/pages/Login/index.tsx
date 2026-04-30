import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const LoginPage: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard', { replace: true });
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch {
      showToast('E-mail ou senha inválidos.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        component="form"
        onSubmit={handleSubmit}
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
            label="Nome do usuario"
            autoComplete="Nome do usuario"
            autoFocus
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting || !username || !password}
            sx={{ mt: 1 }}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;
