import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { FeedbackMessage } from '../../../types/domain'

interface ResponseFormProps {
  threadId: string
  onSubmit: (message: Omit<FeedbackMessage, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
  placeholder?: string
  initialContent?: string
  showSentimentSelector?: boolean
  showTypeSelector?: boolean
  disabled?: boolean
}

export const ResponseForm: React.FC<ResponseFormProps> = ({
  threadId,
  onSubmit,
  onCancel,
  placeholder = 'Type your response...',
  initialContent = '',
  showSentimentSelector = true,
  showTypeSelector = false,
  disabled = false,
}) => {
  const [content, setContent] = useState(initialContent)
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'constructive'>('neutral')
  const [messageType, setMessageType] = useState<'feedback' | 'response'>('response')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Message content is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const message: Omit<FeedbackMessage, 'id' | 'createdAt' | 'updatedAt'> = {
        threadId,
        senderId: 'current-user', // In real app, get from auth context
        content: content.trim(),
        type: messageType,
        sentiment: sentiment !== 'neutral' ? sentiment : undefined,
        readBy: ['current-user'],
      }

      await onSubmit(message)
      
      // Reset form
      setContent('')
      setSentiment('neutral')
      setMessageType('response')
      setAttachments([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getSentimentColor = (sentimentValue: string) => {
    switch (sentimentValue) {
      case 'positive':
        return 'success'
      case 'constructive':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getSentimentEmoji = (sentimentValue: string) => {
    switch (sentimentValue) {
      case 'positive':
        return '😊'
      case 'constructive':
        return '🤔'
      default:
        return '😐'
    }
  }

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Message Type Selector */}
      {showTypeSelector && (
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel>Message Type</InputLabel>
          <Select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as 'feedback' | 'response')}
            label="Message Type"
            disabled={disabled}
          >
            <MenuItem value="response">Response</MenuItem>
            <MenuItem value="feedback">Feedback</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Content Input */}
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || isSubmitting}
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {/* Attachments */}
      {attachments.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Attachments:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {attachments.map((file, index) => (
              <Chip
                key={index}
                label={`${file.name} (${Math.round(file.size / 1024)}KB)`}
                onDelete={() => removeAttachment(index)}
                deleteIcon={<CancelIcon />}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Sentiment Selector */}
          {showSentimentSelector && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Tone</InputLabel>
              <Select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as any)}
                label="Tone"
                disabled={disabled}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{getSentimentEmoji(value)}</span>
                    <span style={{ textTransform: 'capitalize' }}>{value}</span>
                  </Box>
                )}
              >
                <MenuItem value="positive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>😊</span>
                    <span>Positive</span>
                  </Box>
                </MenuItem>
                <MenuItem value="neutral">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>😐</span>
                    <span>Neutral</span>
                  </Box>
                </MenuItem>
                <MenuItem value="constructive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🤔</span>
                    <span>Constructive</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          )}

          {/* File Attachment */}
          <Tooltip title="Attach file">
            <IconButton component="label" disabled={disabled}>
              <AttachFileIcon />
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileAttach}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onCancel && (
            <Button
              onClick={onCancel}
              disabled={isSubmitting}
              color="inherit"
            >
              Cancel
            </Button>
          )}
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!content.trim() || disabled || isSubmitting}
            startIcon={<SendIcon />}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Box>

      {/* Character count */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography
          variant="caption"
          color={content.length > 1000 ? 'error' : 'text.secondary'}
        >
          {content.length}/1000 characters
        </Typography>
      </Box>
    </Paper>
  )
}