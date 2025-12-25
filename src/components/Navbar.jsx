import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Eye, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePresence, useVisitCounter } from '../hooks/usePresence';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { currentUser, isAdmin, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Analytics hooks
  const visitCount = useVisitCounter();
  const onlineCount = usePresence(currentUser?.uid);

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Conócenos', path: '/conocenos' },
    { label: 'Investigación', path: '/investigacion' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Desarrollo', path: '/desarrollo' },
    { label: 'Foro', path: '/foro' },
    { label: 'Contacto', path: '/contacto' },
  ];

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70 }, height: { xs: 64, sm: 70 } }}>
          {/* LOGO */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: 4
            }}
          >
            <img
              src={logo}
              alt="zynapse logo"
              style={{ height: '40px', marginRight: '10px' }}
            />
            <Typography
              variant="h5"
              noWrap
              sx={{
                fontWeight: 800,
                color: '#202124',
                letterSpacing: '-0.05em',
                textTransform: 'lowercase'
              }}
            >
              zynapse
            </Typography>
          </Box>

          {/* MENÚ CENTRAL */}
          <div style={{ flexGrow: 1, display: 'flex', gap: '10px' }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                sx={{ my: 2, color: 'text.secondary', display: 'block', textTransform: 'none', fontWeight: 500 }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* ANALYTICS STATS */}
          <Box sx={{ display: 'flex', gap: 2, mr: 3, alignItems: 'center' }}>
            <Tooltip title="Visitas totales">
              <Chip
                icon={<Eye size={16} />}
                label={visitCount.toLocaleString()}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: '#1976d2', color: '#1976d2' }}
              />
            </Tooltip>
            <Tooltip title="Usuarios online">
              <Chip
                icon={<Users size={16} />}
                label={onlineCount}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: '#2e7d32', color: '#2e7d32' }}
              />
            </Tooltip>
          </Box>

          {/* ÁREA DE USUARIO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isAdmin && (
              <Button
                component={Link}
                to="/admin"
                sx={{ color: '#d32f2f', fontWeight: 600, textTransform: 'none' }}
              >
                Admin
              </Button>
            )}

            {currentUser ? (
              <>
                <Tooltip title="Cuenta">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={currentUser.displayName || ''} src={currentUser.photoURL || ''} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Typography textAlign="center">{currentUser.email}</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Cerrar Sesión</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={loginWithGoogle}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Ingresar
              </Button>
            )}
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;