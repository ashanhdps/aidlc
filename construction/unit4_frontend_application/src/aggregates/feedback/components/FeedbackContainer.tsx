import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import { FeedbackList } from './FeedbackList'
import { FeedbackThread } from './FeedbackThread'
import { NotificationPanel } from './NotificationPanel'
import { FeedbackSearch } from './FeedbackSearch'
import {
  setThreads,
  addThread,
  setCurrentThread,
  setSearchQuery,
  setSearchFilters,
} from '../store/feedbackSlice'
import { FeedbackThread as FeedbackThreadType, FeedbackMessage } from '../../../types/domain'

interface FeedbackContainerProps {
  userId: string
  kpiId?: string
  assessmentId?: string
}

export const FeedbackContainer: React.FC<FeedbackContainerProps> = ({
  userId,
  kpiId,
  assessmentId,
}) => {
  const dispatch = useAppDispatch()
  const { threads, currentThread, search, notifications, loading } = useAppSelector(
    (state) => state.feedback
  )
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [newThreadDialogOpen, setNewThreadDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [newThreadData, setNewThreadData] = useState({
    title: '',
    initialMessage: '',
    participants: [] as string[],
  })

  useEffect(() => {
    // Load feedback threads
    loadFeedbackThreads()
  }, [userId, kpiId, assessmentId])

  const loadFeedbackThreads = async () => {
    try {
      // Mock data - in real app, this would be an API call
      const mockThreads: FeedbackThreadType[] = [
        {
          id: '1',
          title: 'Q3 Performance Review Discussion',
          participants: [userId, 'manager-1'],
          messages: [
            {
              id: 'msg-1',
              threadId: '1',
              senderId: 'manager-1',
              content: 'Great work on the quarterly targets! I wanted to discuss your development goals for Q4.',
              type: 'feedback',
              sentiment: 'positive',
              readBy: [userId],
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          status: 'active',
          kpiId,
          assessmentId,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          title: 'Customer Satisfaction Improvement',
          participants: [userId, 'peer-1', 'manager-1'],
          messages: [
            {
              id: 'msg-2',
              threadId: '2',
              senderId: 'peer-1',
              content: 'I noticed some great improvements in your customer interaction approach. The feedback scores have been consistently higher.',
              type: 'feedback',
              sentiment: 'positive',
              readBy: [],
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              updatedAt: new Date(Date.now() - 172800000).toISOString(),
            },
          ],
          status: 'active',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]

      dispatch(setThreads(mockThreads))
    } catch (error) {
      console.error('Failed to load feedback threads:', error)
    }
  }

  const handleCreateThread = async () => {
    try {
      const newThread: FeedbackThreadType = {
        id: `thread-${Date.now()}`,
        title: newThreadData.title,
        participants: [userId, ...newThreadData.participants],
        messages: [
          {
            id: `msg-${Date.now()}`,
            threadId: `thread-${Date.now()}`,
            senderId: userId,
            content: newThreadData.initialMessage,
            type: 'feedback',
            readBy: [userId],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        status: 'active',
        kpiId,
        assessmentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      dispatch(addThread(newThread))
      setNewThreadDialogOpen(false)
      setNewThreadData({ title: '', initialMessage: '', participants: [] })
    } catch (error) {
      console.error('Failed to create thread:', error)
    }
  }

  const handleThreadSelect = (thread: FeedbackThreadType) => {
    dispatch(setCurrentThread(thread))
  }

  const handleSearch = (query: string, filters: any) => {
    dispatch(setSearchQuery(query))
    dispatch(setSearchFilters(filters))
  }

  const filteredThreads = threads.filter(thread => {
    if (search.query) {
      const queryLower = search.query.toLowerCase()
      return (
        thread.title.toLowerCase().includes(queryLower) ||
        thread.messages.some(msg => 
          msg.content.toLowerCase().includes(queryLower)
        )
      )
    }
    return true
  })

  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        <Paper sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {currentThread ? currentThread.title : 'Feedback'}
            </Typography>
            <Box>
              <Button
                startIcon={<SearchIcon />}
                onClick={() => setSearchDialogOpen(true)}
                size="small"
              >
                Search
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Mobile Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {currentThread ? (
            <FeedbackThread
              thread={currentThread}
              currentUserId={userId}
              onBack={() => dispatch(setCurrentThread(null))}
            />
          ) : (
            <FeedbackList
              threads={filteredThreads}
              onThreadSelect={handleThreadSelect}
              loading={loading.isLoading}
            />
          )}
        </Box>

        {/* Mobile FAB */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setNewThreadDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Feedback & Communication</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<SearchIcon />}
              onClick={() => setSearchDialogOpen(true)}
              variant="outlined"
            >
              Search
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setNewThreadDialogOpen(true)}
              variant="contained"
            >
              New Thread
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Thread List */}
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Conversations</Typography>
                {notifications.unreadCount > 0 && (
                  <Chip
                    label={`${notifications.unreadCount} unread`}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <FeedbackList
                  threads={filteredThreads}
                  onThreadSelect={handleThreadSelect}
                  selectedThreadId={currentThread?.id}
                  loading={loading.isLoading}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Thread Content */}
          <Grid item xs={12} md={5} sx={{ height: '100%' }}>
            <Paper sx={{ height: '100%' }}>
              {currentThread ? (
                <FeedbackThread
                  thread={currentThread}
                  currentUserId={userId}
                />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="h6">
                    Select a conversation to start
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Notifications Panel */}
          <Grid item xs={12} md={3} sx={{ height: '100%' }}>
            <NotificationPanel
              notifications={notifications}
              onNotificationClick={(notification) => {
                // Handle notification click
                if (notification.actionUrl) {
                  // Navigate to specific thread or assessment
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* New Thread Dialog */}
      <Dialog
        open={newThreadDialogOpen}
        onClose={() => setNewThreadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Thread Title"
            value={newThreadData.title}
            onChange={(e) =>
              setNewThreadData({ ...newThreadData, title: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Initial Message"
            value={newThreadData.initialMessage}
            onChange={(e) =>
              setNewThreadData({ ...newThreadData, initialMessage: e.target.value })
            }
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Add Participants</InputLabel>
            <Select
              multiple
              value={newThreadData.participants}
              onChange={(e) =>
                setNewThreadData({
                  ...newThreadData,
                  participants: e.target.value as string[],
                })
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="manager-1">Manager</MenuItem>
              <MenuItem value="peer-1">Team Member 1</MenuItem>
              <MenuItem value="peer-2">Team Member 2</MenuItem>
              <MenuItem value="hr-1">HR Representative</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewThreadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateThread}
            variant="contained"
            disabled={!newThreadData.title || !newThreadData.initialMessage}
          >
            Start Conversation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Dialog */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Search Conversations</DialogTitle>
        <DialogContent>
          <FeedbackSearch
            onSearch={handleSearch}
            initialQuery={search.query}
            initialFilters={search.filters}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}