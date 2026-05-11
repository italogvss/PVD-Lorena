import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', value: '/dashboard' },
  { label: 'PDV', value: '/pos' },
  { label: 'Vendas', value: '/sales' },
  { label: 'Produtos', value: '/products' },
  { label: 'Estoque', value: '/stock' },
];

const ADMIN_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: 'Usuários', value: '/users' },
  { label: 'Gastos', value: '/expenses' },
  { label: 'Relatórios', value: '/reports' },
];

const BottomNav: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const items = isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;
  const current = items.find(i => location.pathname.startsWith(i.value))?.value ?? false;

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        value={current}
        onChange={(_, value) => navigate(value)}
        sx={{ bgcolor: 'background.paper' }}
      >
        {items.map(item => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
