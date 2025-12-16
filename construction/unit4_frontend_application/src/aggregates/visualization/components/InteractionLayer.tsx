import React, { useRef, useCallback, useState } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import { ZoomIn, ZoomOut, PanTool, Refresh } from '@mui/icons-material'

interface InteractionLayerProps {
  width: number | string
  height: number | string
  onZoom: (level: number) => void
  onPan: (offset: { x: number; y: number }) => void
  onSelect: (points: string[]) => void
  zoomLevel: number
  panOffset: { x: number; y: number }
}

export const InteractionLayer: React.FC<InteractionLayerProps> = ({
  width,
  height,
  onZoom,
  onPan,
  onSelect,
  zoomLevel,
  panOffset,
}) => {
  const [isPanning, setIsPanning] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null)

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    const newZoomLevel = Math.min(zoomLevel * 1.2, 5)
    onZoom(newZoomLevel)
  }, [zoomLevel, onZoom])

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    const newZoomLevel = Math.max(zoomLevel / 1.2, 0.2)
    onZoom(newZoomLevel)
  }, [zoomLevel, onZoom])

  // Reset zoom and pan
  const handleReset = useCallback(() => {
    onZoom(1)
    onPan({ x: 0, y: 0 })
  }, [onZoom, onPan])

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    const newZoomLevel = Math.max(0.2, Math.min(5, zoomLevel * delta))
    onZoom(newZoomLevel)
  }, [zoomLevel, onZoom])

  // Handle mouse down for panning or selection
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (event.shiftKey) {
      // Start selection
      setIsSelecting(true)
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y })
    } else {
      // Start panning
      setIsPanning(true)
      lastPanPoint.current = { x: event.clientX, y: event.clientY }
    }
  }, [])

  // Handle mouse move for panning or selection
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning && lastPanPoint.current) {
      const deltaX = event.clientX - lastPanPoint.current.x
      const deltaY = event.clientY - lastPanPoint.current.y
      
      onPan({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      })
      
      lastPanPoint.current = { x: event.clientX, y: event.clientY }
    } else if (isSelecting && selectionBox) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setSelectionBox({
        ...selectionBox,
        endX: x,
        endY: y,
      })
    }
  }, [isPanning, isSelecting, selectionBox, panOffset, onPan])

  // Handle mouse up to end panning or selection
  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionBox) {
      // Complete selection - in a real implementation, this would identify
      // data points within the selection box
      const selectedPoints = [`selection-${Date.now()}`]
      onSelect(selectedPoints)
      setSelectionBox(null)
    }
    
    setIsPanning(false)
    setIsSelecting(false)
    lastPanPoint.current = null
  }, [isSelecting, selectionBox, onSelect])

  // Handle mouse leave to cancel interactions
  const handleMouseLeave = useCallback(() => {
    setIsPanning(false)
    setIsSelecting(false)
    setSelectionBox(null)
    lastPanPoint.current = null
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        cursor: isPanning ? 'grabbing' : isSelecting ? 'crosshair' : 'grab',
        userSelect: 'none',
        pointerEvents: 'all',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Selection box */}
      {selectionBox && (
        <Box
          sx={{
            position: 'absolute',
            left: Math.min(selectionBox.startX, selectionBox.endX),
            top: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.endX - selectionBox.startX),
            height: Math.abs(selectionBox.endY - selectionBox.startY),
            border: '2px dashed #1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Interaction controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          padding: 0.5,
          boxShadow: 1,
        }}
      >
        <Tooltip title="Zoom In" placement="left">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomIn fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out" placement="left">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOut fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Reset View" placement="left">
          <IconButton size="small" onClick={handleReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Zoom level indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 1,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
        }}
      >
        {(zoomLevel * 100).toFixed(0)}%
      </Box>

      {/* Pan offset indicator */}
      {(panOffset.x !== 0 || panOffset.y !== 0) && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
          }}
        >
          Pan: {panOffset.x.toFixed(0)}, {panOffset.y.toFixed(0)}
        </Box>
      )}

      {/* Instructions overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 1,
          borderRadius: 1,
          fontSize: '0.75rem',
          maxWidth: 200,
          boxShadow: 1,
        }}
      >
        <div><strong>Interactions:</strong></div>
        <div>• Drag to pan</div>
        <div>• Scroll to zoom</div>
        <div>• Shift+drag to select</div>
        <div>• Click data points to select</div>
      </Box>
    </Box>
  )
}