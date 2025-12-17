import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material'
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useAppDispatch } from '../../../hooks/redux'
import { ResponseForm } from './ResponseForm'
import { ThreadActions } from './ThreadActions'
import { addMessage, markMessageAsRead, resolveThread, archiveThread } from '../store/feedbackSlice'
import { FeedbackThread as FeedbackThreadType, FeedbackMessage } from '../../../types/domain'
import { formatDistanceToNow, format } from 'date-fns'

interface FeedbackThreadProps {
  thread: FeedbackThreadType
  currentUserId: string
  onBack?: () => void
}

export const FeedbackThread: React.FC<FeedbackThreadProps> = ({
  thread,
  currentUserId,
  onBack,
}) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'resolve' | 'archive' | null
  }>({ open: false, action: null })

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom()
    
    // Mark messages as read
    thread.messages.forEach(message => {
      if (!message.readBy.includes(currentUserId) && message.senderId !== currentUserId) {
        dispatch(markMessageAsRead({
          threadId: thread.id,
          messageId: message.id,
          userId: currentUserId,
        }))
      }
    })
  }, [thread.messages, currentUserId, dispatch, thread.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message: FeedbackMessage = {
      id: `msg-${Date.now()}`,
      threadId: thread.id,
      senderId: currentUserId,
      content: newMessage.trim(),
      type: 'response',
      readBy: [currentUserId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(addMessage({ threadId: thread.id, message }))
    setNewMessage('')
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleAction = (action: 'resolve' | 'archive') => {
    setConfirmDialog({ open: true, action })
    handleMenuClose()
  }

  const confirmAction = () => {
    if (confirmDialog.action === 'resolve') {
      dispatch(resolveThread(thread.id))
    } else if (confirmDialog.action === 'archive') {
      dispatch(archiveThread(thread.id))
    }
    setConfirmDialog({ open: false, action: null })
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return theme.palette.success.light
      case 'constructive':
        return theme.palette.warning.light
      default:
        return theme.palette.grey[100]
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return '🤖'
      case 'feedback':
        return '💬'
      default:
        return '↩️'
    }
  }

  const isOwnMessage = (message: FeedbackMessage) => message.senderId === currentUserId

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        elevation={0}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onBack && (
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              {thread.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={thread.status}
                size="small"
                color={thread.status === 'resolved' ? 'success' : 'primary'}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                {thread.participants.length} participants
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleAction('resolve')} disabled={thread.status === 'resolved'}>
              <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
              Mark as Resolved
            </MenuItem>
            <MenuItem onClick={() => handleAction('archive')} disabled={thread.status === 'archived'}>
              <ArchiveIcon sx={{ mr: 1 }} fontSize="small" />
              Archive Thread
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {thread.messages.map((message, index) => {
          const isOwn = isOwnMessage(message)
          const showAvatar = index === 0 || thread.messages[index - 1].senderId !== message.senderId
          const showTimestamp = index === thread.messages.length - 1 || 
            thread.messages[index + 1].senderId !== message.senderId

          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                mb: 1,
                alignItems: 'flex-end',
              }}
            >
              {/* Avatar */}
              <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                {showAvatar && !isOwn && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>

              {/* Message Content */}
              <Box
                sx={{
                  maxWidth: '70%',
                  mx: 1,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: isOwn ? 'primary.main' : getSentimentColor(message.sentiment),
                    color: isOwn ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: isOwn ? 2 : showAvatar ? 2 : 0.5,
                    borderTopRightRadius: isOwn ? (showAvatar ? 2 : 0.5) : 2,
                  }}
                  elevation={1}
                >
                  {/* Message Type Indicator */}
                  {message.type !== 'response' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {getMessageTypeIcon(message.type)} {message.type}
                      </Typography>
                    </Box>
                  )}

                  {/* Message Content */}
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>

                  {/* Sentiment Indicator */}
                  {message.sentiment && message.sentiment !== 'neutral' && (
                    <Chip
                      label={message.sentiment}
                      size="small"
                      sx={{ mt: 1, opacity: 0.8 }}
                      variant="outlined"
                    />
                  )}
                </Paper>

                {/* Timestamp */}
                {showTimestamp && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      textAlign: isOwn ? 'right' : 'left',
                      mt: 0.5,
                      px: 1,
                    }}
                  >
                    {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    {!isOwn && message.readBy.includes(currentUserId) && ' • Read'}
                  </Typography>
                )}
              </Box>
            </Box>
          )
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      {thread.status === 'active' && (
        <Paper
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
          elevation={0}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{ mb: 0.5 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
      >
        <DialogTitle>
          Confirm {confirmDialog.action === 'resolve' ? 'Resolution' : 'Archive'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} this conversation?
            {confirmDialog.action === 'resolve' && ' This will mark it as resolved.'}
            {confirmDialog.action === 'archive' && ' This will move it to the archive.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
            Cancel
          </Button>
          <Button onClick={confirmAction} variant="contained">
            {confirmDialog.action === 'resolve' ? 'Resolve' : 'Archive'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}