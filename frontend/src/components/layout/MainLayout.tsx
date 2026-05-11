import { FC, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAuth } from '../../hooks/useAuth';
import { useThemeMode } from '../../theme/Theme';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Realizar Venda', path: '/pos',   icon: <PointOfSaleIcon /> },
  { label: 'Estoque',        path: '/stock',  icon: <InventoryIcon /> },
  { label: 'Histórico de Vendas', path: '/sales', icon: <ReceiptLongIcon /> },
  { label: 'Relatórios',     path: '/reports', icon: <BarChartIcon /> },
];

const ADMIN_ITEMS = [
  { label: 'Usuários', path: '/users', icon: <PeopleAltIcon /> },
  { label: 'Gastos', path: '/expenses', icon: <AccountBalanceWalletIcon /> },
];

const MainLayout: FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { themeVariant, toggleThemeVariant } = useThemeMode();

  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  const isSelected = (path: string) =>
    location.pathname === path ||
    (path.length > 1 && location.pathname.startsWith(path));

  const handleNav = (path: string) => {
    navigate(path);
    if (!isDesktop) setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box
        onClick={() => handleNav('/dashboard')}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1.5,
          py: 3.5,
          cursor: 'pointer',
        }}
      >
        <img src="/favicon.png" alt="" style={{ width: 32, height: 32 }} />
        <Typography variant="h4" color="primary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
          Catavento
        </Typography>
      </Box>

      <Divider />

      {/* Operador */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}
        >
          Operador
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}
        >
          {user?.name}
        </Typography>
      </Box>

      <Divider />

      {/* Nav items */}
      <List sx={{ px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => {
          const selected = isSelected(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'background.default',
                  '& .MuiListItemIcon-root': { color: 'background.default' },
                  '& .MuiTypography-root': { color: 'background.default', fontWeight: 700 },
                  '&:hover': { bgcolor: 'primary.main' },
                },
                '&:not(.Mui-selected):hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      {/* Theme + Logout */}
      <Divider sx={{ mt: 'auto' }} />
      <List sx={{ px: 1.5, py: 1 }}>
        <ListItemButton
          onClick={toggleThemeVariant}
          sx={{
            borderRadius: 2,
            transition: 'all 0.2s ease',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <PaletteIcon />
          </ListItemIcon>
          <ListItemText
            primary={themeVariant === 'party' ? 'Tema Padrão' : 'Tema Catavento'}
            slotProps={{ primary: { variant: 'body2' } }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 2,
            transition: 'all 0.2s ease',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'error.main',
              '& .MuiListItemIcon-root': { color: 'error.main' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </Box>
  );

  const drawerSx = {
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
      boxSizing: 'border-box' as const,
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile top bar */}
      {!isDesktop && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src="/favicon.png" alt="" style={{ width: 24, height: 24 }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                Catavento
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop — permanent drawer */}
      {isDesktop && (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, ...drawerSx }}>
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile — temporary drawer */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={drawerSx}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Page content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: '64px', md: 0 },
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
