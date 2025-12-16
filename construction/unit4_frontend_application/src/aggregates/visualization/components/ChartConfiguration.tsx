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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Chip,
  Alert,
} from '@mui/material'
import {
  Settings,
  ExpandMore,
  Palette,
  Timeline,
  BarChart,
  PieChart,
  GridOn,
} from '@mui/icons-material'
import { ChartConfiguration as ChartConfigType, Visualization } from '../../../types/domain'

interface ChartConfigurationProps {
  visualization: Visualization
  onConfigurationChange: (config: ChartConfigType) => void
  onVisualizationTypeChange?: (type: string) => void
}

export const ChartConfiguration: React.FC<ChartConfigurationProps> = ({
  visualization,
  onConfigurationChange,
  onVisualizationTypeChange,
}) => {
  const [open, setOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState<ChartConfigType>(visualization.configuration)
  const [localType, setLocalType] = useState(visualization.type)

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: <Timeline /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChart /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChart /> },
    { value: 'heatmap', label: 'Heat Map', icon: <GridOn /> },
    { value: 'scatter', label: 'Scatter Plot', icon: <Timeline /> },
  ]

  const colorSchemes = [
    { name: 'Default', colors: ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0'] },
    { name: 'Pastel', colors: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba', '#ffdfba'] },
    { name: 'Vibrant', colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'] },
    { name: 'Professional', colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'] },
    { name: 'Warm', colors: ['#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#d35400'] },
    { name: 'Cool', colors: ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60'] },
  ]

  const legendPositions = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ]

  const axisTypes = [
    { value: 'category', label: 'Category' },
    { value: 'number', label: 'Number' },
    { value: 'time', label: 'Time' },
  ]

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...localConfig }
    
    // Handle nested field updates
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      newConfig[parent as keyof ChartConfigType] = {
        ...newConfig[parent as keyof ChartConfigType],
        [child]: value,
      }
    } else {
      newConfig[field as keyof ChartConfigType] = value
    }
    
    setLocalConfig(newConfig)
  }

  const handleSave = () => {
    onConfigurationChange(localConfig)
    if (onVisualizationTypeChange && localType !== visualization.type) {
      onVisualizationTypeChange(localType)
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalConfig(visualization.configuration)
    setLocalType(visualization.type)
    setOpen(false)
  }

  const handleColorSchemeSelect = (colors: string[]) => {
    // In a real implementation, this would update the chart's color scheme
    console.log('Selected color scheme:', colors)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Settings />}
        onClick={() => setOpen(true)}
        size="small"
      >
        Configure
      </Button>

      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chart Configuration
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Chart Type Selection */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Chart Type</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {chartTypes.map((type) => (
                    <Chip
                      key={type.value}
                      icon={type.icon}
                      label={type.label}
                      clickable
                      color={localType === type.value ? 'primary' : 'default'}
                      onClick={() => setLocalType(type.value)}
                    />
                  ))}
                </Box>
                
                {localType !== visualization.type && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Changing chart type will reset some configuration options
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Dimensions */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Dimensions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" gap={2} mb={2}>
                  <TextField
                    label="Width"
                    type="number"
                    value={localConfig.width || 400}
                    onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                    InputProps={{ endAdornment: 'px' }}
                  />
                  <TextField
                    label="Height"
                    type="number"
                    value={localConfig.height || 300}
                    onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                    InputProps={{ endAdornment: 'px' }}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localConfig.responsive}
                      onChange={(e) => handleConfigChange('responsive', e.target.checked)}
                    />
                  }
                  label="Responsive (auto-resize)"
                />
              </AccordionDetails>
            </Accordion>

            {/* Legend Configuration */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Legend</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localConfig.legend.show}
                      onChange={(e) => handleConfigChange('legend.show', e.target.checked)}
                    />
                  }
                  label="Show Legend"
                />
                
                {localConfig.legend.show && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Position</InputLabel>
                    <Select
                      value={localConfig.legend.position}
                      label="Position"
                      onChange={(e) => handleConfigChange('legend.position', e.target.value)}
                    >
                      {legendPositions.map((pos) => (
                        <MenuItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Axes Configuration */}
            {(localType === 'line' || localType === 'bar' || localType === 'scatter') && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Axes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    X-Axis
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Label"
                      value={localConfig.axes.xAxis.label || ''}
                      onChange={(e) => handleConfigChange('axes.xAxis.label', e.target.value)}
                      fullWidth
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={localConfig.axes.xAxis.type}
                        label="Type"
                        onChange={(e) => handleConfigChange('axes.xAxis.type', e.target.value)}
                      >
                        {axisTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Y-Axis
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Label"
                      value={localConfig.axes.yAxis.label || ''}
                      onChange={(e) => handleConfigChange('axes.yAxis.label', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Min Value"
                      type="number"
                      value={localConfig.axes.yAxis.min || ''}
                      onChange={(e) => handleConfigChange('axes.yAxis.min', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="Auto"
                    />
                    <TextField
                      label="Max Value"
                      type="number"
                      value={localConfig.axes.yAxis.max || ''}
                      onChange={(e) => handleConfigChange('axes.yAxis.max', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="Auto"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Tooltip Configuration */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Tooltip</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localConfig.tooltip.show}
                      onChange={(e) => handleConfigChange('tooltip.show', e.target.checked)}
                    />
                  }
                  label="Show Tooltip"
                />
                
                {localConfig.tooltip.show && (
                  <TextField
                    fullWidth
                    label="Format Template"
                    value={localConfig.tooltip.format || ''}
                    onChange={(e) => handleConfigChange('tooltip.format', e.target.value)}
                    placeholder="e.g., {name}: {value}"
                    helperText="Use {name}, {value}, {x}, {y} as placeholders"
                    sx={{ mt: 2 }}
                  />
                )}
              </AccordionDetails>
            </Accordion>

            {/* Color Scheme */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Palette sx={{ mr: 1 }} />
                  <Typography variant="h6">Color Scheme</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>
                  Select a color scheme for your chart:
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {colorSchemes.map((scheme) => (
                    <Box
                      key={scheme.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => handleColorSchemeSelect(scheme.colors)}
                    >
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        {scheme.name}
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        {scheme.colors.map((color, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: color,
                              borderRadius: 0.5,
                              border: '1px solid rgba(0,0,0,0.1)',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Apply Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}