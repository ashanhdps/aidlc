import React from 'react'
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material'
import { DashboardLayout as DashboardLayoutType } from '../../../types/domain'

interface DashboardLayoutProps {
  layout: DashboardLayoutType
  isCustomizing: boolean
  onLayoutChange: (layout: DashboardLayoutType) => void
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  layout,
  isCustomizing,
  onLayoutChange,
  children
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  // Responsive layout adjustments
  const getResponsiveColumns = () => {
    if (!layout.responsive) return layout.columns
    
    if (isMobile) return Math.min(layout.columns, 1)
    if (isTablet) return Math.min(layout.columns, 2)
    return layout.columns
  }

  const getResponsiveSpacing = () => {
    if (isMobile) return 2
    if (isTablet) return 2.5
    return 3
  }

  const handleLayoutUpdate = (newColumns: number, newRows: number) => {
    if (isCustomizing) {
      onLayoutChange({
        ...layout,
        columns: newColumns,
        rows: newRows,
      })
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: `${layout.rows * 200}px`, // Approximate row height
        position: 'relative',
        ...(isCustomizing && {
          border: `2px dashed ${theme.palette.primary.main}`,
          borderRadius: 1,
          p: 1,
        }),
      }}
    >
      {isCustomizing && (
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: 0,
            display: 'flex',
            gap: 1,
            zIndex: 1000,
          }}
        >
          <Box
            component="button"
            onClick={() => handleLayoutUpdate(layout.columns + 1, layout.rows)}
            sx={{
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: 0.5,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white',
              },
            }}
          >
            +Col
          </Box>
          <Box
            component="button"
            onClick={() => handleLayoutUpdate(Math.max(1, layout.columns - 1), layout.rows)}
            sx={{
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: 0.5,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white',
              },
            }}
          >
            -Col
          </Box>
          <Box
            component="button"
            onClick={() => handleLayoutUpdate(layout.columns, layout.rows + 1)}
            sx={{
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: 0.5,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white',
              },
            }}
          >
            +Row
          </Box>
          <Box
            component="button"
            onClick={() => handleLayoutUpdate(layout.columns, Math.max(1, layout.rows - 1))}
            sx={{
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: 0.5,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white',
              },
            }}
          >
            -Row
          </Box>
        </Box>
      )}

      <Grid container spacing={getResponsiveSpacing()}>
        {children}
      </Grid>

      {isCustomizing && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            fontSize: '0.75rem',
            color: 'text.secondary',
            bgcolor: 'background.paper',
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {getResponsiveColumns()} × {layout.rows} grid
          {layout.responsive && (isMobile || isTablet) && ' (responsive)'}
        </Box>
      )}
    </Box>
  )
}