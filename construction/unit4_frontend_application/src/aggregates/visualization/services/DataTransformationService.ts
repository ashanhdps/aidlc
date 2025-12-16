import { DataSeries, DataPoint, Visualization } from '../../../types/domain'

/**
 * Data Transformation Service
 * Transforms backend API data into UI-appropriate formats and structures
 */
class DataTransformationService {
  /**
   * Transform raw API data into chart-ready format
   */
  transformForChart(rawData: any[], chartType: string): DataSeries[] {
    switch (chartType) {
      case 'line':
      case 'bar':
      case 'scatter':
        return this.transformForCartesianChart(rawData)
      
      case 'pie':
        return this.transformForPieChart(rawData)
      
      case 'heatmap':
        return this.transformForHeatMap(rawData)
      
      default:
        throw new Error(`Unsupported chart type: ${chartType}`)
    }
  }

  /**
   * Transform data for line, bar, and scatter charts
   */
  private transformForCartesianChart(rawData: any[]): DataSeries[] {
    // Group data by series
    const seriesMap = new Map<string, DataPoint[]>()

    rawData.forEach(item => {
      const seriesName = item.series || item.name || 'Default'
      
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, [])
      }

      const dataPoint: DataPoint = {
        x: item.x || item.date || item.category,
        y: item.y || item.value || 0,
        label: item.label,
        metadata: {
          ...item.metadata,
          originalItem: item,
        },
      }

      seriesMap.get(seriesName)!.push(dataPoint)
    })

    // Convert to DataSeries array
    return Array.from(seriesMap.entries()).map(([name, data], index) => ({
      id: `series-${index}`,
      name,
      data: data.sort((a, b) => {
        // Sort by x value (handle both string and number)
        if (typeof a.x === 'number' && typeof b.x === 'number') {
          return a.x - b.x
        }
        return String(a.x).localeCompare(String(b.x))
      }),
      color: this.getSeriesColor(index),
    }))
  }

  /**
   * Transform data for pie charts
   */
  private transformForPieChart(rawData: any[]): DataSeries[] {
    const dataPoints: DataPoint[] = rawData.map(item => ({
      x: item.name || item.category || item.label,
      y: item.value || item.y || 0,
      label: item.label || item.name,
      metadata: {
        percentage: 0, // Will be calculated later
        originalItem: item,
      },
    }))

    // Calculate percentages
    const total = dataPoints.reduce((sum, point) => sum + point.y, 0)
    dataPoints.forEach(point => {
      if (point.metadata) {
        point.metadata.percentage = total > 0 ? (point.y / total) * 100 : 0
      }
    })

    return [{
      id: 'pie-series',
      name: 'Pie Data',
      data: dataPoints,
      color: undefined, // Pie charts use individual colors per slice
    }]
  }

  /**
   * Transform data for heat maps
   */
  private transformForHeatMap(rawData: any[]): DataSeries[] {
    // Group data by Y-axis categories
    const seriesMap = new Map<string, DataPoint[]>()

    rawData.forEach(item => {
      const yCategory = item.yCategory || item.row || item.series || 'Default'
      
      if (!seriesMap.has(yCategory)) {
        seriesMap.set(yCategory, [])
      }

      const dataPoint: DataPoint = {
        x: item.x || item.xCategory || item.column,
        y: item.value || item.y || 0,
        label: item.label,
        metadata: {
          intensity: 0, // Will be calculated later
          originalItem: item,
        },
      }

      seriesMap.get(yCategory)!.push(dataPoint)
    })

    // Calculate intensity values for color mapping
    const allValues = Array.from(seriesMap.values())
      .flat()
      .map(point => point.y)
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)

    // Convert to DataSeries array with intensity calculations
    return Array.from(seriesMap.entries()).map(([name, data], index) => ({
      id: `heatmap-series-${index}`,
      name,
      data: data.map(point => ({
        ...point,
        metadata: {
          ...point.metadata,
          intensity: maxValue > minValue ? (point.y - minValue) / (maxValue - minValue) : 0.5,
        },
      })),
      color: this.getSeriesColor(index),
    }))
  }

  /**
   * Aggregate data by time period
   */
  aggregateByTimePeriod(
    data: DataSeries[], 
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ): DataSeries[] {
    return data.map(series => ({
      ...series,
      data: this.aggregateDataPoints(series.data, period),
    }))
  }

  /**
   * Filter data by date range
   */
  filterByDateRange(data: DataSeries[], startDate: Date, endDate: Date): DataSeries[] {
    return data.map(series => ({
      ...series,
      data: series.data.filter(point => {
        const pointDate = new Date(point.x)
        return pointDate >= startDate && pointDate <= endDate
      }),
    }))
  }

  /**
   * Apply statistical transformations
   */
  applyStatisticalTransform(
    data: DataSeries[], 
    transform: 'none' | 'movingAverage' | 'cumulative' | 'percentage'
  ): DataSeries[] {
    switch (transform) {
      case 'movingAverage':
        return this.applyMovingAverage(data, 3) // 3-period moving average
      
      case 'cumulative':
        return this.applyCumulative(data)
      
      case 'percentage':
        return this.applyPercentageChange(data)
      
      default:
        return data
    }
  }

  /**
   * Normalize data for comparison
   */
  normalizeData(data: DataSeries[], method: 'minMax' | 'zScore' | 'percentage'): DataSeries[] {
    switch (method) {
      case 'minMax':
        return this.applyMinMaxNormalization(data)
      
      case 'zScore':
        return this.applyZScoreNormalization(data)
      
      case 'percentage':
        return this.applyPercentageNormalization(data)
      
      default:
        return data
    }
  }

  /**
   * Get color for series based on index
   */
  private getSeriesColor(index: number): string {
    const colors = [
      '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0',
      '#00acc1', '#d32f2f', '#689f38', '#f57c00', '#512da8'
    ]
    return colors[index % colors.length]
  }

  /**
   * Aggregate data points by time period
   */
  private aggregateDataPoints(
    data: DataPoint[], 
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ): DataPoint[] {
    const aggregated = new Map<string, { sum: number; count: number; items: DataPoint[] }>()

    data.forEach(point => {
      const date = new Date(point.x)
      const key = this.getTimePeriodKey(date, period)
      
      if (!aggregated.has(key)) {
        aggregated.set(key, { sum: 0, count: 0, items: [] })
      }
      
      const agg = aggregated.get(key)!
      agg.sum += point.y
      agg.count += 1
      agg.items.push(point)
    })

    return Array.from(aggregated.entries()).map(([key, agg]) => ({
      x: key,
      y: agg.sum / agg.count, // Average value
      label: `${period} average`,
      metadata: {
        sum: agg.sum,
        count: agg.count,
        period,
        items: agg.items,
      },
    }))
  }

  /**
   * Get time period key for aggregation
   */
  private getTimePeriodKey(date: Date, period: string): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0]
      
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split('T')[0]
      
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `${date.getFullYear()}-Q${quarter}`
      
      case 'yearly':
        return String(date.getFullYear())
      
      default:
        return date.toISOString()
    }
  }

  /**
   * Apply moving average transformation
   */
  private applyMovingAverage(data: DataSeries[], window: number): DataSeries[] {
    return data.map(series => ({
      ...series,
      data: series.data.map((point, index) => {
        const start = Math.max(0, index - window + 1)
        const windowData = series.data.slice(start, index + 1)
        const average = windowData.reduce((sum, p) => sum + p.y, 0) / windowData.length
        
        return {
          ...point,
          y: average,
          metadata: {
            ...point.metadata,
            originalValue: point.y,
            windowSize: windowData.length,
          },
        }
      }),
    }))
  }

  /**
   * Apply cumulative transformation
   */
  private applyCumulative(data: DataSeries[]): DataSeries[] {
    return data.map(series => {
      let cumulative = 0
      return {
        ...series,
        data: series.data.map(point => {
          cumulative += point.y
          return {
            ...point,
            y: cumulative,
            metadata: {
              ...point.metadata,
              originalValue: point.y,
              cumulative: true,
            },
          }
        }),
      }
    })
  }

  /**
   * Apply percentage change transformation
   */
  private applyPercentageChange(data: DataSeries[]): DataSeries[] {
    return data.map(series => ({
      ...series,
      data: series.data.map((point, index) => {
        if (index === 0) {
          return {
            ...point,
            y: 0, // First point has no previous value
            metadata: {
              ...point.metadata,
              originalValue: point.y,
              percentageChange: 0,
            },
          }
        }
        
        const previousValue = series.data[index - 1].y
        const percentageChange = previousValue !== 0 
          ? ((point.y - previousValue) / previousValue) * 100 
          : 0
        
        return {
          ...point,
          y: percentageChange,
          metadata: {
            ...point.metadata,
            originalValue: point.y,
            previousValue,
            percentageChange,
          },
        }
      }),
    }))
  }

  /**
   * Apply min-max normalization
   */
  private applyMinMaxNormalization(data: DataSeries[]): DataSeries[] {
    // Find global min and max across all series
    const allValues = data.flatMap(series => series.data.map(point => point.y))
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const range = maxValue - minValue

    return data.map(series => ({
      ...series,
      data: series.data.map(point => ({
        ...point,
        y: range > 0 ? (point.y - minValue) / range : 0,
        metadata: {
          ...point.metadata,
          originalValue: point.y,
          normalized: true,
          normalizationMethod: 'minMax',
        },
      })),
    }))
  }

  /**
   * Apply z-score normalization
   */
  private applyZScoreNormalization(data: DataSeries[]): DataSeries[] {
    // Calculate global mean and standard deviation
    const allValues = data.flatMap(series => series.data.map(point => point.y))
    const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length
    const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length
    const stdDev = Math.sqrt(variance)

    return data.map(series => ({
      ...series,
      data: series.data.map(point => ({
        ...point,
        y: stdDev > 0 ? (point.y - mean) / stdDev : 0,
        metadata: {
          ...point.metadata,
          originalValue: point.y,
          normalized: true,
          normalizationMethod: 'zScore',
        },
      })),
    }))
  }

  /**
   * Apply percentage normalization (relative to total)
   */
  private applyPercentageNormalization(data: DataSeries[]): DataSeries[] {
    return data.map(series => {
      const total = series.data.reduce((sum, point) => sum + point.y, 0)
      
      return {
        ...series,
        data: series.data.map(point => ({
          ...point,
          y: total > 0 ? (point.y / total) * 100 : 0,
          metadata: {
            ...point.metadata,
            originalValue: point.y,
            normalized: true,
            normalizationMethod: 'percentage',
            total,
          },
        })),
      }
    })
  }
}

export const dataTransformationService = new DataTransformationService()