import React from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Badge,
  Skeleton,
  Divider,
} from '@mui/material'
import {
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material'
import { FeedbackThread } from '../../../types/domain'
import { formatDistanceToNow } from 'date-fns'

interface FeedbackListProps {
  threads: FeedbackThread[]
  onThreadSelect: (thread: FeedbackThread) => void
  selectedThreadId?: string
  loading?: boolean
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  threads,
  onThreadSelect,
  selectedThreadId,
  loading = false,
}) => {
  const getUnreadCount = (thread: FeedbackThread, currentUserId: string): number => {
    return thread.messages.filter(
      message => !message.readBy.includes(currentUserId) && message.senderId !== currentUserId
    ).length
  }

  const getLastMessage = (thread: FeedbackThread) => {
    if (thread.messages.length === 0) return null
    return thread.messages[thread.messages.length - 1]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon color="success" fontSize="small" />
      case 'archived':
        return <ArchiveIcon color="disabled" fontSize="small" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success'
      case 'archived':
        return 'default'
      default:
        return 'primary'
    }
  }

  if (loading) {
    return (
      <List>
        {Array.from({ length: 5 }).map((_, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Skeleton variant="circular" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton variant="text" width="80%" />}
              secondary={<Skeleton variant="text" width="60%" />}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  if (threads.length === 0) {
    return (
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
        <GroupIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" gutterBottom>
          No conversations yet
        </Typography>
        <Typography variant="body2" textAlign="center">
          Start a new conversation to begin collaborating with your team.
        </Typography>
      </Box>
    )
  }

  return (
    <List sx={{ height: '100%', overflow: 'auto', p: 0 }}>
      {threads.map((thread, index) => {
        const lastMessage = getLastMessage(thread)
        const unreadCount = getUnreadCount(thread, 'current-user') // In real app, get from auth
        const isSelected = thread.id === selectedThreadId

        return (
          <React.Fragment key={thread.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onThreadSelect(thread)}
                selected={isSelected}
                sx={{
                  py: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    invisible={unreadCount === 0}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {thread.participants.length > 2 ? (
                        <GroupIcon />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {thread.title}
                      </Typography>
                      {getStatusIcon(thread.status)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      {lastMessage && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.5,
                          }}
                        >
                          {lastMessage.content}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={thread.status}
                          size="small"
                          color={getStatusColor(thread.status) as any}
                          variant="outlined"
                        />
                        {lastMessage && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < threads.length - 1 && <Divider />}
          </React.Fragment>
        )
      })}
    </List>
  )
}