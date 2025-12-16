import React, { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout, setCurrentPath, setBreadcrumbs } from '../../aggregates/session/store/sessionSlice'
import { NavigationMenu } from '../../aggregates/session/components/NavigationMenu'
import { NavigationManager } from '../../aggregates/session/services/NavigationManager'
import { AuthenticationManager } from '../../aggregates/session/services/AuthenticationManager'
import { Breadcrumbs } from './Breadcrumbs'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user, notifications } = useAppSelector((state) => state.session)
  const { notifications: feedbackNotifications } = useAppSelector((state) => state.feedback)
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null)
  
  const navigationManager = new NavigationManager()
  const authManager = new AuthenticationManager()

  useEffect(() => {
    // Update current path and breadcrumbs when location changes
    dispatch(setCurrentPath(location.pathname))
    
    const breadcrumbs = navigationManager.getBreadcrumbs(location.pathname)
    dispatch(setBreadcrumbs(breadcrumbs))
    
    // Add to recent paths
    navigationManager.addRecentPath(location.pathname)
  }, [location.pathname, dispatch])

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget)
  }

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null)
  }

  const handleLogout = async () => {
    try {
      await authManager.logout()
      dispatch(logout())
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
    handleUserMenuClose()
  }

  const handleProfileClick = () => {
    navigate('/settings/profile')
    handleUserMenuClose()
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    handleUserMenuClose()
  }

  const totalUnreadNotifications = feedbackNotifications.unreadCount

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Menu */}
      <NavigationMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onToggle={handleMenuToggle}
        variant="permanent"
      />

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar
          position="sticky"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
          }}
          elevation={0}
        >
          <Toolbar>
            {/* Menu Button (for mobile) */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleMenuToggle}
              edge="start"
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page Title */}
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {navigationManager.getPageTitle(location.pathname)}
            </Typography>

            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={totalUnreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              sx={{ ml: 1 }}
            >
              {user?.avatar ? (
                <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user ? getInitials(user.firstName, user.lastName) : <AccountCircleIcon />}
                </Avatar>
              )}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Breadcrumbs */}
        <Box sx={{ px: 3, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Breadcrumbs />
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            minHeight: 0, // Allow content to shrink
          }}
        >
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleProfileClick}>
          <AccountCircleIcon sx={{ mr: 1 }} fontSize="small" />
          Profile
        </MenuItem>
        
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            maxWidth: 360,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">
            Notifications ({totalUnreadNotifications})
          </Typography>
        </Box>
        
        <Divider />
        
        {totalUnreadNotifications === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => navigate('/feedback')}>
            <Typography variant="body2">
              {totalUnreadNotifications} unread message{totalUnreadNotifications > 1 ? 's' : ''}
            </Typography>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => navigate('/notifications')}>
          <Typography variant="body2" color="primary">
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}