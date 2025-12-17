import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Badge,
  IconButton,
  Chip,
  Button,
  Divider,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { useAppDispatch } from '../../../hooks/redux'
import { markNotificationAsRead, clearNotifications } from '../store/feedbackSlice'
import { NotificationState, Notification } from '../../../types/domain'
import { formatDistanceToNow } from 'date-fns'

interface NotificationPanelProps {
  notifications: NotificationState
  onNotificationClick?: (notification: Notification) => void
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const dispatch = useAppDispatch()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id))
    }
    onNotificationClick?.(notification)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleClearAll = () => {
    dispatch(clearNotifications())
    handleMenuClose()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feedback':
        return <MessageIcon color="primary" />
      case 'assessment':
        return <AssessmentIcon color="secondary" />
      case 'kpi_update':
        return <TrendingUpIcon color="success" />
      case 'system':
        return <SettingsIcon color="action" />
      default:
        return <NotificationsIcon color="action" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  const sortedNotifications = [...notifications.notifications].sort((a, b) => {
    // Unread first, then by creation date
    if (a.read !== b.read) {
      return a.read ? 1 : -1
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={notifications.unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <IconButton onClick={handleMenuClick} size="small">
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleClearAll} disabled={notifications.notifications.length === 0}>
            <ClearIcon sx={{ mr: 1 }} fontSize="small" />
            Clear All
          </MenuItem>
        </Menu>
      </Box>

      {/* Notifications List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {notifications.notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
              color: 'text.secondary',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              All caught up!
            </Typography>
            <Typography variant="body2" textAlign="center">
              You have no new notifications.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: notification.read ? 'action.hover' : 'action.selected',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.read ? 'normal' : 'bold',
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 0.5,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < sortedNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Quick Actions */}
      {notifications.unreadCount > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => {
              notifications.notifications
                .filter(n => !n.read)
                .forEach(n => dispatch(markNotificationAsRead(n.id)))
            }}
          >
            Mark All as Read ({notifications.unreadCount})
          </Button>
        </Box>
      )}

      {/* Summary Stats */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Total: {notifications.notifications.length} notifications
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Unread: {notifications.unreadCount}
        </Typography>
      </Box>
    </Paper>
  )
}