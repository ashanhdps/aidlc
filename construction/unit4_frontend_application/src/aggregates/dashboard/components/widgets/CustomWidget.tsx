import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  MoreVert,
  Edit,
  Code,
  Image,
  Link,
  Save,
} from '@mui/icons-material'
import { DashboardWidget } from '../../../../types/domain'

interface CustomWidgetProps {
  widget: DashboardWidget
  data?: any
  isCustomizing: boolean
  onUpdate: (widget: DashboardWidget) => void
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({
  widget,
  data,
  isCustomizing,
  onUpdate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editContent, setEditContent] = useState(widget.data?.content || '')
  const [editTitle, setEditTitle] = useState(widget.title)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleSave = () => {
    const updatedWidget = {
      ...widget,
      title: editTitle,
      data: {
        ...widget.data,
        content: editContent,
        lastUpdated: new Date().toISOString(),
      },
    }
    onUpdate(updatedWidget)
    setEditDialogOpen(false)
  }

  const handleCancel = () => {
    setEditContent(widget.data?.content || '')
    setEditTitle(widget.title)
    setEditDialogOpen(false)
  }

  const renderContent = () => {
    const content = widget.data?.content || data?.content

    if (!content) {
      return (
        <Box 
          display="flex" 
          flexDirection="column"
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          color="text.secondary"
          textAlign="center"
          p={2}
        >
          <Code sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="body2" gutterBottom>
            Custom Widget
          </Typography>
          <Typography variant="caption">
            Click edit to add custom content
          </Typography>
        </Box>
      )
    }

    // Check if content is HTML/JSX
    if (content.includes('<') && content.includes('>')) {
      return (
        <Box
          sx={{
            '& img': { maxWidth: '100%', height: 'auto' },
            '& a': { color: 'primary.main' },
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
    }

    // Check if content is a URL (for embedding)
    if (content.startsWith('http')) {
      return (
        <Box
          component="iframe"
          src={content}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 1,
          }}
          title={widget.title}
        />
      )
    }

    // Plain text content
    return (
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography>
    )
  }

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <CardHeader
          title={
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {widget.title}
            </Typography>
          }
          action={
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          }
          sx={{ pb: 1 }}
        />
        
        <CardContent sx={{ flexGrow: 1, pt: 0, overflow: 'auto' }}>
          {renderContent()}
        </CardContent>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Content
          </MenuItem>
        </Menu>

        {isCustomizing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ 
              bgcolor: 'background.paper', 
              px: 1, 
              py: 0.5, 
              borderRadius: 0.5,
              border: 1,
              borderColor: 'divider',
            }}>
              Custom Widget
            </Typography>
          </Box>
        )}
      </Card>

      <Dialog
        open={editDialogOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Custom Widget</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Widget Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            margin="normal"
            multiline
            rows={8}
            placeholder="Enter custom content here...&#10;&#10;Supported formats:&#10;- Plain text&#10;- HTML content&#10;- URLs for embedding"
            helperText="You can use HTML tags, plain text, or URLs for embedding external content"
          />

          <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              Content Types:
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.5}>
                <Code fontSize="small" />
                <Typography variant="caption">HTML/Text</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Image fontSize="small" />
                <Typography variant="caption">Images</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Link fontSize="small" />
                <Typography variant="caption">External URLs</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            startIcon={<Save />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}