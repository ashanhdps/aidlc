import { Dashboard, DashboardWidget } from '../../../types/domain'
import { FilterContext } from '../../../types/common'
import { dashboardRepository } from '../../../services/repositories/DashboardRepository'
import { eventStore, DashboardEvents } from '../../../services/EventStore'
import { store } from '../../../store/store'
import { setCurrentDashboard, updateWidget, applyFilters, setLoading, setError } from '../store/dashboardSlice'

/**
 * Dashboard Orchestration Service
 * Coordinates dashboard loading, widget management, and real-time updates
 */
class DashboardOrchestrationService {
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map()
  private webSocketConnected = false

  /**
   * Initialize dashboard for a user
   */
  async initializeDashboard(userId: string, dashboardType: 'personal' | 'team' | 'executive' = 'personal'): Promise<Dashboard> {
    try {
      store.dispatch(setLoading(true))

      // Load dashboard configuration
      let dashboard = await dashboardRepository.getDashboardConfiguration(userId, dashboardType)

      if (!dashboard) {
        // Create default dashboard if none exists
        const userRole = store.getState().session.user?.role.name || 'employee'
        const defaultDashboard = await dashboardRepository.getDefaultDashboardTemplate(userRole)
        
        defaultDashboard.userId = userId
        defaultDashboard.id = `dashboard-${userId}-${Date.now()}`
        
        dashboard = await dashboardRepository.saveDashboardConfiguration(defaultDashboard)
      }

      // Set dashboard in store
      store.dispatch(setCurrentDashboard(dashboard))

      // Start auto-refresh for widgets
      this.startAutoRefresh(dashboard)

      // Emit dashboard loaded event
      await eventStore.append(
        dashboard.id,
        'dashboard',
        DashboardEvents.LOADED,
        { userId, dashboardType, widgetCount: dashboard.widgets.length },
        userId
      )

      return dashboard
    } catch (error) {
      console.error('Failed to initialize dashboard:', error)
      store.dispatch(setError('Failed to initialize dashboard'))
      throw error
    } finally {
      store.dispatch(setLoading(false))
    }
  }

  /**
   * Update widget data and refresh UI
   */
  async updateWidgetData(widgetId: string, data: any): Promise<void> {
    try {
      const currentState = store.getState().dashboard
      const widget = currentState.widgets.find(w => w.id === widgetId)
      
      if (!widget) {
        throw new Error(`Widget ${widgetId} not found`)
      }

      const updatedWidget: DashboardWidget = {
        ...widget,
        data,
        configuration: {
          ...widget.configuration,
          // Update last refresh time
        }
      }

      store.dispatch(updateWidget(updatedWidget))

      // Update in repository
      if (currentState.currentDashboard) {
        await dashboardRepository.updateWidget(currentState.currentDashboard.id, updatedWidget)
      }

      // Emit widget updated event
      await eventStore.append(
        currentState.currentDashboard?.id || 'unknown',
        'dashboard',
        DashboardEvents.WIDGET_UPDATED,
        { widgetId, dataSize: JSON.stringify(data).length },
        currentState.currentDashboard?.userId
      )
    } catch (error) {
      console.error('Failed to update widget data:', error)
      store.dispatch(setError(`Failed to update widget: ${error}`))
    }
  }

  /**
   * Apply filters across all dashboard widgets
   */
  async applyDashboardFilters(filters: FilterContext): Promise<void> {
    try {
      store.dispatch(applyFilters(filters))

      const currentState = store.getState().dashboard
      if (currentState.currentDashboard) {
        // Update dashboard with new filters
        const updatedDashboard = {
          ...currentState.currentDashboard,
          filters,
          updatedAt: new Date().toISOString(),
        }

        await dashboardRepository.saveDashboardConfiguration(updatedDashboard)
        store.dispatch(setCurrentDashboard(updatedDashboard))

        // Refresh all widgets with new filters
        await this.refreshAllWidgets(updatedDashboard)

        // Emit filter applied event
        await eventStore.append(
          updatedDashboard.id,
          'dashboard',
          DashboardEvents.FILTER_APPLIED,
          { 
            filterTypes: Object.keys(filters),
            timeRange: filters.timeRange.period,
            categoriesCount: filters.categories?.length || 0,
          },
          updatedDashboard.userId
        )
      }
    } catch (error) {
      console.error('Failed to apply filters:', error)
      store.dispatch(setError('Failed to apply filters'))
    }
  }

  /**
   * Add a new widget to the dashboard
   */
  async addWidget(widget: Omit<DashboardWidget, 'id'>): Promise<void> {
    try {
      const currentState = store.getState().dashboard
      if (!currentState.currentDashboard) {
        throw new Error('No active dashboard')
      }

      const newWidget: DashboardWidget = {
        ...widget,
        id: `widget-${Date.now()}`,
      }

      await dashboardRepository.updateWidget(currentState.currentDashboard.id, newWidget)
      store.dispatch(updateWidget(newWidget))

      // Emit widget added event
      await eventStore.append(
        currentState.currentDashboard.id,
        'dashboard',
        DashboardEvents.WIDGET_UPDATED,
        { action: 'added', widgetType: newWidget.type },
        currentState.currentDashboard.userId
      )
    } catch (error) {
      console.error('Failed to add widget:', error)
      store.dispatch(setError('Failed to add widget'))
    }
  }

  /**
   * Remove a widget from the dashboard
   */
  async removeWidget(widgetId: string): Promise<void> {
    try {
      const currentState = store.getState().dashboard
      if (!currentState.currentDashboard) {
        throw new Error('No active dashboard')
      }

      await dashboardRepository.removeWidget(currentState.currentDashboard.id, widgetId)
      
      // Remove from store
      const updatedWidgets = currentState.widgets.filter(w => w.id !== widgetId)
      const updatedDashboard = {
        ...currentState.currentDashboard,
        widgets: updatedWidgets,
        updatedAt: new Date().toISOString(),
      }

      store.dispatch(setCurrentDashboard(updatedDashboard))

      // Stop auto-refresh for this widget
      this.stopWidgetRefresh(widgetId)

      // Emit widget removed event
      await eventStore.append(
        currentState.currentDashboard.id,
        'dashboard',
        DashboardEvents.WIDGET_UPDATED,
        { action: 'removed', widgetId },
        currentState.currentDashboard.userId
      )
    } catch (error) {
      console.error('Failed to remove widget:', error)
      store.dispatch(setError('Failed to remove widget'))
    }
  }

  /**
   * Start auto-refresh for dashboard widgets
   */
  private startAutoRefresh(dashboard: Dashboard): void {
    dashboard.widgets.forEach(widget => {
      const refreshInterval = widget.configuration.refreshInterval || 300000 // 5 minutes default
      
      if (refreshInterval > 0) {
        const intervalId = setInterval(async () => {
          await this.refreshWidget(widget.id)
        }, refreshInterval)

        this.refreshIntervals.set(widget.id, intervalId)
      }
    })
  }

  /**
   * Refresh a specific widget
   */
  private async refreshWidget(widgetId: string): Promise<void> {
    try {
      const currentState = store.getState().dashboard
      const widget = currentState.widgets.find(w => w.id === widgetId)
      
      if (!widget) return

      // Simulate data refresh - in real app, this would fetch from APIs
      const refreshedData = {
        ...widget.data,
        lastRefresh: new Date().toISOString(),
        refreshCount: (widget.data?.refreshCount || 0) + 1,
      }

      await this.updateWidgetData(widgetId, refreshedData)
    } catch (error) {
      console.error(`Failed to refresh widget ${widgetId}:`, error)
    }
  }

  /**
   * Refresh all widgets with current filters
   */
  private async refreshAllWidgets(dashboard: Dashboard): Promise<void> {
    const refreshPromises = dashboard.widgets.map(widget => 
      this.refreshWidget(widget.id)
    )

    await Promise.allSettled(refreshPromises)
  }

  /**
   * Stop auto-refresh for a specific widget
   */
  private stopWidgetRefresh(widgetId: string): void {
    const intervalId = this.refreshIntervals.get(widgetId)
    if (intervalId) {
      clearInterval(intervalId)
      this.refreshIntervals.delete(widgetId)
    }
  }

  /**
   * Stop all auto-refresh intervals
   */
  stopAllRefresh(): void {
    this.refreshIntervals.forEach((intervalId) => {
      clearInterval(intervalId)
    })
    this.refreshIntervals.clear()
  }

  /**
   * Handle real-time dashboard updates
   */
  handleRealTimeUpdate(event: any): void {
    switch (event.type) {
      case 'kpi-updated':
        this.handleKPIUpdate(event.payload)
        break
      case 'widget-data-changed':
        this.handleWidgetDataChange(event.payload)
        break
      case 'dashboard-shared':
        this.handleDashboardShared(event.payload)
        break
      default:
        console.log('Unknown real-time event:', event.type)
    }
  }

  private handleKPIUpdate(payload: any): void {
    // Update widgets that display this KPI
    const currentState = store.getState().dashboard
    const affectedWidgets = currentState.widgets.filter(widget => 
      widget.configuration.dataSource === payload.kpiId
    )

    affectedWidgets.forEach(widget => {
      this.updateWidgetData(widget.id, payload.data)
    })
  }

  private handleWidgetDataChange(payload: any): void {
    this.updateWidgetData(payload.widgetId, payload.data)
  }

  private handleDashboardShared(payload: any): void {
    // Handle dashboard sharing notifications
    console.log('Dashboard shared:', payload)
  }

  /**
   * Export dashboard configuration
   */
  async exportDashboard(dashboardId: string): Promise<string> {
    try {
      const currentState = store.getState().dashboard
      const dashboard = currentState.currentDashboard

      if (!dashboard || dashboard.id !== dashboardId) {
        throw new Error('Dashboard not found')
      }

      const exportData = {
        dashboard,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export dashboard:', error)
      throw error
    }
  }

  /**
   * Import dashboard configuration
   */
  async importDashboard(configJson: string, userId: string): Promise<Dashboard> {
    try {
      const importData = JSON.parse(configJson)
      const dashboard = importData.dashboard as Dashboard

      // Update dashboard for current user
      dashboard.userId = userId
      dashboard.id = `dashboard-${userId}-${Date.now()}`
      dashboard.createdAt = new Date().toISOString()
      dashboard.updatedAt = new Date().toISOString()

      // Save imported dashboard
      const savedDashboard = await dashboardRepository.saveDashboardConfiguration(dashboard)
      
      return savedDashboard
    } catch (error) {
      console.error('Failed to import dashboard:', error)
      throw error
    }
  }
}

export const dashboardOrchestrationService = new DashboardOrchestrationService()