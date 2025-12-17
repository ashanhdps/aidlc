import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Alert,
} from '@mui/material'
import { Edit, Save, Cancel, Settings } from '@mui/icons-material'
import { Dashboard } from '../../../types/domain'

interface DashboardCustomizerProps {
  isCustomizing: boolean
  onToggleCustomization: () => void
  onSave: (dashboard: Dashboard) => void
  dashboard: Dashboard
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  isCustomizing,
  onToggleCustomization,
  onSave,
  dashboard,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [localDashboard, setLocalDashboard] = useState<Dashboard>(dashboard)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingsChange = (field: string, value: any) => {
    const updatedDashboard = {
      ...localDashboard,
      [field]: value,
    }
    setLocalDashboard(updatedDashboard)
    setHasChanges(true)
  }

  const handleLayoutChange = (field: string, value: any) => {
    const updatedLayout = {
      ...localDashboard.layout,
      [field]: value,
    }
    const updatedDashboard = {
      ...localDashboard,
      layout: updatedLayout,
    }
    setLocalDashboard(updatedDashboard)
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(localDashboard)
    setHasChanges(false)
    setSettingsOpen(false)
  }

  const handleCancel = () => {
    setLocalDashboard(dashboard)
    setHasChanges(false)
    setSettingsOpen(false)
    if (isCustomizing) {
      onToggleCustomization()
    }
  }

  return (
    <Box display="flex" gap={1}>
      <Button
        variant="outlined"
        startIcon={<Settings />}
        onClick={() => setSettingsOpen(true)}
        size="small"
      >
        Settings
      </Button>
      
      <Button
        variant={isCustomizing ? "contained" : "outlined"}
        startIcon={isCustomizing ? <Save /> : <Edit />}
        onClick={isCustomizing ? () => onSave(localDashboard) : onToggleCustomization}
        color={isCustomizing ? "success" : "primary"}
        size="small"
      >
        {isCustomizing ? 'Save Layout' : 'Customize'}
      </Button>
      
      {isCustomizing && (
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={onToggleCustomization}
          color="error"
          size="small"
        >
          Cancel
        </Button>
      )}

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {hasChanges && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have unsaved changes
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <TextField
              fullWidth
              label="Dashboard Name"
              value={localDashboard.name}
              onChange={(e) => handleSettingsChange('name', e.target.value)}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Description"
              value={localDashboard.description || ''}
              onChange={(e) => handleSettingsChange('description', e.target.value)}
              margin="normal"
              multiline
              rows={2}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={localDashboard.isDefault}
                  onChange={(e) => handleSettingsChange('isDefault', e.target.checked)}
                />
              }
              label="Set as default dashboard"
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Layout Settings
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Columns</InputLabel>
                <Select
                  value={localDashboard.layout.columns}
                  label="Columns"
                  onChange={(e) => handleLayoutChange('columns', e.target.value)}
                >
                  {[1, 2, 3, 4, 6, 12].map((cols) => (
                    <MenuItem key={cols} value={cols}>
                      {cols} columns
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Rows</InputLabel>
                <Select
                  value={localDashboard.layout.rows}
                  label="Rows"
                  onChange={(e) => handleLayoutChange('rows', e.target.value)}
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((rows) => (
                    <MenuItem key={rows} value={rows}>
                      {rows} rows
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={localDashboard.layout.responsive}
                  onChange={(e) => handleLayoutChange('responsive', e.target.checked)}
                />
              }
              label="Responsive layout (adapts to screen size)"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Auto-refresh Settings
            </Typography>

            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Refresh Interval</InputLabel>
                <Select
                  value={localDashboard.filters.timeRange.period || 'monthly'}
                  label="Refresh Interval"
                  onChange={(e) => {
                    // This would update refresh settings
                    console.log('Refresh interval:', e.target.value)
                  }}
                >
                  <MenuItem value="none">No auto-refresh</MenuItem>
                  <MenuItem value="30s">30 seconds</MenuItem>
                  <MenuItem value="1m">1 minute</MenuItem>
                  <MenuItem value="5m">5 minutes</MenuItem>
                  <MenuItem value="15m">15 minutes</MenuItem>
                  <MenuItem value="30m">30 minutes</MenuItem>
                </Select>
              </FormControl>
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
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}