import React, { useState } from 'react'
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Share as ShareIcon,
  Flag as FlagIcon,
} from '@mui/icons-material'
import { FeedbackThread } from '../../../types/domain'

interface ThreadActionsProps {
  thread: FeedbackThread
  currentUserId: string
  onResolve?: (threadId: string) => void
  onArchive?: (threadId: string) => void
  onDelete?: (threadId: string) => void
  onEdit?: (threadId: string, newTitle: string) => void
  onAddParticipant?: (threadId: string, userId: string) => void
  onRemoveParticipant?: (threadId: string, userId: string) => void
  onToggleNotifications?: (threadId: string, enabled: boolean) => void
  onShare?: (threadId: string) => void
  onReport?: (threadId: string, reason: string) => void
  disabled?: boolean
}

export const ThreadActions: React.FC<ThreadActionsProps> = ({
  thread,
  currentUserId,
  onResolve,
  onArchive,
  onDelete,
  onEdit,
  onAddParticipant,
  onRemoveParticipant,
  onToggleNotifications,
  onShare,
  onReport,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [reportDialog, setReportDialog] = useState(false)
  const [addParticipantDialog, setAddParticipantDialog] = useState(false)
  
  const [editTitle, setEditTitle] = useState(thread.title)
  const [reportReason, setReportReason] = useState('')
  const [newParticipant, setNewParticipant] = useState('')
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true) // In real app, get from user preferences

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleResolve = () => {
    onResolve?.(thread.id)
    handleMenuClose()
  }

  const handleArchive = () => {
    onArchive?.(thread.id)
    handleMenuClose()
  }

  const handleEdit = () => {
    if (editTitle.trim() && editTitle !== thread.title) {
      onEdit?.(thread.id, editTitle.trim())
    }
    setEditDialog(false)
    handleMenuClose()
  }

  const handleDelete = () => {
    onDelete?.(thread.id)
    setDeleteDialog(false)
    handleMenuClose()
  }

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport?.(thread.id, reportReason.trim())
    }
    setReportDialog(false)
    setReportReason('')
    handleMenuClose()
  }

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      onAddParticipant?.(thread.id, newParticipant.trim())
    }
    setAddParticipantDialog(false)
    setNewParticipant('')
    handleMenuClose()
  }

  const handleToggleNotifications = () => {
    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    onToggleNotifications?.(thread.id, newState)
    handleMenuClose()
  }

  const handleShare = () => {
    onShare?.(thread.id)
    handleMenuClose()
  }

  const canEdit = thread.participants.includes(currentUserId)
  const canDelete = thread.participants.includes(currentUserId) && thread.status !== 'archived'
  const canResolve = thread.status === 'active'
  const canArchive = thread.status !== 'archived'

  return (
    <>
      <Tooltip title="Thread actions">
        <IconButton
          onClick={handleMenuOpen}
          disabled={disabled}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        {/* Edit Thread */}
        {canEdit && (
          <MenuItem onClick={() => setEditDialog(true)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Title</ListItemText>
          </MenuItem>
        )}

        {/* Resolve Thread */}
        {canResolve && onResolve && (
          <MenuItem onClick={handleResolve}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Resolved</ListItemText>
          </MenuItem>
        )}

        {/* Archive Thread */}
        {canArchive && onArchive && (
          <MenuItem onClick={handleArchive}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Manage Participants */}
        {canEdit && (
          <>
            <MenuItem onClick={() => setAddParticipantDialog(true)}>
              <ListItemIcon>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Participant</ListItemText>
            </MenuItem>
            
            {thread.participants.length > 2 && (
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonRemoveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove Participant</ListItemText>
              </MenuItem>
            )}
          </>
        )}

        {/* Notifications */}
        <MenuItem onClick={handleToggleNotifications}>
          <ListItemIcon>
            {notificationsEnabled ? (
              <NotificationsOffIcon fontSize="small" />
            ) : (
              <NotificationsIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {notificationsEnabled ? 'Mute' : 'Unmute'} Notifications
          </ListItemText>
        </MenuItem>

        {/* Share */}
        {onShare && (
          <MenuItem onClick={handleShare}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share Thread</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Report */}
        <MenuItem onClick={() => setReportDialog(true)}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report Issue</ListItemText>
        </MenuItem>

        {/* Delete */}
        {canDelete && onDelete && (
          <MenuItem onClick={() => setDeleteDialog(true)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Thread</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Thread Title</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Thread Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={!editTitle.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Thread</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this thread? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Issue</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please describe the issue you'd like to report about this thread.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for reporting"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleReport} color="error" variant="contained" disabled={!reportReason.trim()}>
            Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={addParticipantDialog} onClose={() => setAddParticipantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID or Email"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            margin="normal"
            placeholder="Enter user ID or email address"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddParticipantDialog(false)}>Cancel</Button>
          <Button onClick={handleAddParticipant} variant="contained" disabled={!newParticipant.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}