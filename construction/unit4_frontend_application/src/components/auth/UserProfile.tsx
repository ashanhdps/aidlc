import React, { useState } from 'react'
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../aggregates/session/store/sessionSlice'

export const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.session.authentication)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    // Clear stored authentication
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_profile')
    
    // Dispatch logout action
    dispatch(logout())
    
    handleMenuClose()
  }

  const handleShowDetails = () => {
    setShowDetails(true)
    handleMenuClose()
  }

  if (!user) {
    return null
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'error'
      case 'manager': return 'primary'
      case 'supervisor': return 'secondary'
      case 'employee': return 'default'
      default: return 'default'
    }
  }

  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handleMenuOpen} size="small">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} />
            ) : (
              getInitials(user.firstName, user.lastName)
            )}
          </Avatar>
        </IconButton>
        
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" fontWeight="medium">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1)}
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Box mt={1}>
            <Chip
              label={user.role.name.toUpperCase()}
              size="small"
              color={getRoleColor(user.role.name) as any}
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleShowDetails}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* User Details Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Profile Details</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} />
              ) : (
                getInitials(user.firstName, user.lastName)
              )}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.department}
              </Typography>
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Role
            </Typography>
            <Chip
              label={user.role.name.toUpperCase()}
              color={getRoleColor(user.role.name) as any}
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Permissions
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {user.permissions.map((permission) => (
                <Chip
                  key={permission}
                  label={permission}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}