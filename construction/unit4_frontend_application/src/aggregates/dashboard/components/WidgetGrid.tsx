import React from 'react'
import { Grid, Box } from '@mui/material'
import { DashboardWidget, KPI, InsightData } from '../../../types/domain'
import { KPIWidget } from './widgets/KPIWidget'
import { ChartWidget } from './widgets/ChartWidget'
import { InsightWidget } from './widgets/InsightWidget'
import { CustomWidget } from './widgets/CustomWidget'

interface WidgetGridProps {
  widgets: DashboardWidget[]
  kpis: KPI[]
  insights: InsightData[]
  isCustomizing: boolean
  onWidgetUpdate: (widget: DashboardWidget) => void
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  kpis,
  insights,
  isCustomizing,
  onWidgetUpdate,
}) => {
  const getWidgetData = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'kpi':
        return kpis.find(kpi => kpi.id === widget.configuration.dataSource)
      case 'insight':
        return insights.find(insight => insight.id === widget.configuration.dataSource)
      case 'chart':
        // For chart widgets, we might need to aggregate KPI data
        return kpis.filter(kpi => 
          widget.configuration.dataSource === 'all' || 
          kpi.category === widget.configuration.dataSource
        )
      default:
        return null
    }
  }

  const renderWidget = (widget: DashboardWidget) => {
    const data = getWidgetData(widget)
    
    const commonProps = {
      widget,
      isCustomizing,
      onUpdate: onWidgetUpdate,
    }

    switch (widget.type) {
      case 'kpi':
        return (
          <KPIWidget
            {...commonProps}
            kpi={data as KPI}
          />
        )
      
      case 'chart':
        return (
          <ChartWidget
            {...commonProps}
            data={data as KPI[]}
          />
        )
      
      case 'insight':
        return (
          <InsightWidget
            {...commonProps}
            insight={data as InsightData}
          />
        )
      
      case 'custom':
        return (
          <CustomWidget
            {...commonProps}
            data={data}
          />
        )
      
      default:
        return null
    }
  }

  const getGridSize = (widget: DashboardWidget) => {
    // Convert widget position to Material-UI grid sizes
    const { width } = widget.position
    
    // Assuming 12-column grid system
    const xs = Math.min(12, Math.max(1, width))
    const sm = Math.min(12, Math.max(1, Math.floor(width * 0.8)))
    const md = Math.min(12, Math.max(1, Math.floor(width * 0.6)))
    
    return { xs, sm, md }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {widgets.map((widget) => {
          const gridSize = getGridSize(widget)
          
          return (
            <Grid 
              item 
              key={widget.id}
              {...gridSize}
            >
              <Box
                sx={{
                  height: `${widget.position.height * 100}px`,
                  minHeight: 200,
                  position: 'relative',
                  ...(isCustomizing && {
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'action.hover',
                    },
                  }),
                }}
              >
                {renderWidget(widget)}
                
                {isCustomizing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      display: 'flex',
                      gap: 0.5,
                      zIndex: 1000,
                    }}
                  >
                    <Box
                      component="button"
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: 'none',
                        bgcolor: 'error.main',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                      onClick={() => {
                        // Handle widget removal
                        console.log('Remove widget:', widget.id)
                      }}
                      title="Remove widget"
                    >
                      ×
                    </Box>
                    <Box
                      component="button"
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: 'none',
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                      onClick={() => {
                        // Handle widget configuration
                        console.log('Configure widget:', widget.id)
                      }}
                      title="Configure widget"
                    >
                      ⚙
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          )
        })}
        
        {isCustomizing && (
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                height: 200,
                border: '2px dashed',
                borderColor: 'grey.400',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => {
                // Handle adding new widget
                console.log('Add new widget')
              }}
            >
              <Box textAlign="center" color="text.secondary">
                <Box fontSize="2rem" mb={1}>+</Box>
                <Box>Add Widget</Box>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}