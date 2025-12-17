import { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  GetApp,
  PictureAsPdf,
  TableChart,
  Image,
  Share,
} from '@mui/icons-material'
import { Visualization } from '../../../types/domain'
import { useAppDispatch } from '../../../hooks/redux'
import { startExport, updateExportProgress, completeExport } from '../store/visualizationSlice'

interface ExportControlsProps {
  visualization: Visualization
  onExport?: (format: string, options: any) => void
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  visualization,
  onExport,
}) => {
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'png'>('csv')
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeMetadata: true,
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'auto',
    filename: visualization.title || 'chart-export',
    imageWidth: 1200,
    imageHeight: 800,
    imageQuality: 0.9,
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleExportClick = (format: 'csv' | 'excel' | 'pdf' | 'png') => {
    setExportFormat(format)
    setExportDialogOpen(true)
    handleMenuClose()
  }

  const handleExportConfirm = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportError(null)

    try {
      // Dispatch export start action
      dispatch(startExport({ format: exportFormat, chartId: visualization.id }))

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return newProgress
        })
      }, 200)

      // Perform the actual export
      await performExport(exportFormat, exportOptions)

      // Complete export
      dispatch(completeExport(0)) // Assuming first export job
      
      setTimeout(() => {
        setIsExporting(false)
        setExportDialogOpen(false)
        setExportProgress(0)
      }, 500)

    } catch (error) {
      setExportError(`Export failed: ${error}`)
      setIsExporting(false)
    }
  }

  const performExport = async (format: string, options: any) => {
    switch (format) {
      case 'csv':
        return exportToCSV(options)
      case 'excel':
        return exportToExcel(options)
      case 'pdf':
        return exportToPDF(options)
      case 'png':
        return exportToPNG(options)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  const exportToCSV = async (options: any) => {
    const csvData = convertDataToCSV(visualization.data, options)
    downloadFile(csvData, `${options.filename}.csv`, 'text/csv')
  }

  const exportToExcel = async (options: any) => {
    // In a real implementation, this would use a library like xlsx
    const csvData = convertDataToCSV(visualization.data, options)
    downloadFile(csvData, `${options.filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  const exportToPDF = async (options: any) => {
    // In a real implementation, this would use a library like jsPDF
    const pdfContent = `PDF Export of ${visualization.title}\nGenerated on: ${new Date().toLocaleString()}`
    downloadFile(pdfContent, `${options.filename}.pdf`, 'application/pdf')
  }

  const exportToPNG = async (options: any) => {
    // In a real implementation, this would capture the chart as an image
    const canvas = document.createElement('canvas')
    canvas.width = options.imageWidth
    canvas.height = options.imageHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'black'
      ctx.font = '20px Arial'
      ctx.fillText(`Chart: ${visualization.title}`, 50, 50)
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${options.filename}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png', options.imageQuality)
  }

  const convertDataToCSV = (dataSeries: any[], options: any) => {
    let csv = ''
    
    if (options.includeHeaders) {
      csv += 'Series,X,Y,Value,Label\n'
    }
    
    dataSeries.forEach(series => {
      series.data.forEach((point: any) => {
        csv += `"${series.name}","${point.x}","${point.y}","${point.y}","${point.label || ''}"\n`
      })
    })
    
    return csv
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: visualization.title,
        text: `Check out this chart: ${visualization.title}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      // Show a toast or alert that URL was copied
    }
    handleMenuClose()
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<GetApp />}
        onClick={handleMenuOpen}
        size="small"
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleExportClick('csv')}>
          <TableChart sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('excel')}>
          <TableChart sx={{ mr: 1 }} />
          Export as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('pdf')}>
          <PictureAsPdf sx={{ mr: 1 }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('png')}>
          <Image sx={{ mr: 1 }} />
          Export as Image
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} />
          Share Chart
        </MenuItem>
      </Menu>

      <Dialog
        open={exportDialogOpen}
        onClose={() => !isExporting && setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export Chart - {exportFormat.toUpperCase()}
        </DialogTitle>
        
        <DialogContent>
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exportError}
            </Alert>
          )}

          {isExporting ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Exporting chart...
              </Typography>
              <LinearProgress variant="determinate" value={exportProgress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {exportProgress}% complete
              </Typography>
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Filename"
                value={exportOptions.filename}
                onChange={(e) => setExportOptions({ ...exportOptions, filename: e.target.value })}
                margin="normal"
              />

              {(exportFormat === 'csv' || exportFormat === 'excel') && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.includeHeaders}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeHeaders: e.target.checked })}
                      />
                    }
                    label="Include column headers"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.includeMetadata}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                      />
                    }
                    label="Include metadata"
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={exportOptions.dateFormat}
                      label="Date Format"
                      onChange={(e) => setExportOptions({ ...exportOptions, dateFormat: e.target.value })}
                    >
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="ISO">ISO 8601</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {exportFormat === 'png' && (
                <>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Width (px)"
                      type="number"
                      value={exportOptions.imageWidth}
                      onChange={(e) => setExportOptions({ ...exportOptions, imageWidth: parseInt(e.target.value) })}
                      margin="normal"
                    />
                    <TextField
                      label="Height (px)"
                      type="number"
                      value={exportOptions.imageHeight}
                      onChange={(e) => setExportOptions({ ...exportOptions, imageHeight: parseInt(e.target.value) })}
                      margin="normal"
                    />
                  </Box>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Quality</InputLabel>
                    <Select
                      value={exportOptions.imageQuality}
                      label="Quality"
                      onChange={(e) => setExportOptions({ ...exportOptions, imageQuality: parseFloat(e.target.value as string) })}
                    >
                      <MenuItem value={0.6}>Low (60%)</MenuItem>
                      <MenuItem value={0.8}>Medium (80%)</MenuItem>
                      <MenuItem value={0.9}>High (90%)</MenuItem>
                      <MenuItem value={1.0}>Maximum (100%)</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExportConfirm}
            variant="contained"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}