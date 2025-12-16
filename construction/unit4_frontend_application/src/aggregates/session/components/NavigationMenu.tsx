import React, { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Feedback as FeedbackIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../hooks/redux'
import { NavigationManager, NavigationItem } from '../services/NavigationManager'
import { usePermissions } from './PermissionGate'

interface NavigationMenuProps {
  open: boolean
  onClose: () => void
  onToggle: () => void
  variant?: 'permanent' | 'temporary'
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  open,
  onClose,
  onToggle,
  variant = 'permanent',
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.session)
  const { permissions, roles } = usePermissions()
  
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  const navigationManager = new NavigationManager()
  const navigationItems = navigationManager.getNavigationItems(permissions, roles[0] || 'employee')

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'dashboard':
        return <DashboardIcon />
      case 'assessment':
        return <AssessmentIcon />
      case 'feedback':
        return <FeedbackIcon />
      case 'group':
        return <GroupIcon />
      case 'business':
        return <BusinessIcon />
      case 'analytics':
        return <AnalyticsIcon />
      case 'settings':
        return <SettingsIcon />
      default:
        return <DashboardIcon />
    }
  }

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      // Toggle expansion for items with children
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      )
    } else {
      // Navigate to the item's path
      navigate(item.path)
      if (isMobile) {
        onClose()
      }
    }
  }

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.path === location.pathname) {
      return true
    }
    
    // Check if any child is active
    if (item.children) {
      return item.children.some(child => isItemActive(child))
    }
    
    return false
  }

  const isItemExpanded = (item: NavigationItem): boolean => {
    return expandedItems.includes(item.id) || 
           (item.children?.some(child => isItemActive(child)) ?? false)
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isActive = isItemActive(item)
    const isExpanded = isItemExpanded(item)

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={isActive && !hasChildren}
            disabled={item.disabled}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: level > 0 ? 4 + level * 2 : 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {getIcon(item.icon)}
                </Badge>
              ) : (
                getIcon(item.icon)
              )}
            </ListItemIcon>
            
            <ListItemText
              primary={item.label}
              sx={{ opacity: open ? 1 : 0 }}
            />
            
            {hasChildren && open && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {/* Render children */}
        {hasChildren && open && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  const drawerWidth = 280
  const collapsedWidth = 64

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 1,
          py: 2,
          minHeight: 64,
        }}
      >
        {open && (
          <Typography variant="h6" noWrap component="div">
            Performance Hub
          </Typography>
        )}
        
        {!isMobile && (
          <Tooltip title={open ? 'Collapse menu' : 'Expand menu'}>
            <IconButton onClick={onToggle} size="small">
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* User Info */}
      {open && user && (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary">
            Welcome back,
          </Typography>
          <Typography variant="subtitle2" noWrap>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.role.name} • {user.department}
          </Typography>
        </Box>
      )}

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      {open && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Version 1.0.0
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant={variant}
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}