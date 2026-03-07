import React from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Button, Avatar, 
  Menu, MenuItem, ListItemIcon, Divider 
} from '@mui/material';
import { Sprout, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const Header = ({ 
  user, 
  signInWithGoogle, 
  handleLogout, 
  anchorEl, 
  open, 
  handleMenuOpen, 
  handleMenuClose 
}) => {
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#2e7d32', width: '100%' }}>
      <Toolbar>
        {/* Left Side: Logo and Title */}
        <Sprout style={{ marginRight: '8px' }} size={24} />
    
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            fontSize: { xs: '1rem', sm: '1.25rem' }, 
            letterSpacing: '-0.5px'
          }}
        >
          {window.innerWidth < 400 ? "GARDEN PRO" : "GARDEN PLANNER PRO"}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side: User Profile / Login */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!user ? (
            <Button 
              variant="contained" 
              onClick={signInWithGoogle} 
              sx={{ 
                bgcolor: '#1b5e20',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#145214' } 
              }}
            >
              Sign In
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                  Welcome,
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                  {user.displayName?.split(' ')[0]}
                </Typography>
              </Box>
              
              <Avatar 
                src={user.photoURL} 
                alt={user.displayName} 
                onClick={handleMenuOpen}
                sx={{ 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }, 
                  border: '2px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }} 
              />

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 150,
                    boxShadow: '0px 10px 25px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1, display: { xs: 'block', md: 'none' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user.displayName}
                  </Typography>
                </Box>
                <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
                
                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f', fontWeight: 600 }}>
                  <ListItemIcon>
                    <LogOut size={18} color="#d32f2f" />
                  </ListItemIcon>
                  LogOut
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
      <Toaster position="top-right" reverseOrder={false} />
    </AppBar>
  );
};

export default Header;