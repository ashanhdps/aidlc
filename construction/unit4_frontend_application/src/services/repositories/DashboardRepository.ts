import { Dashboard, DashboardConfiguration, DashboardWidget } from '../../types/domain'

class DashboardRepository {
  private dashboards: Map<string, Dashboard> = new Map()
  private userDashboards: Map<string, string[]> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    const mockDashboard: Dashboard = {
      id: 'dashboard-1',
      userId: 'user1',
      name: 'Personal Performance Dashboard',
      description: 'My personal KPI dashboard',
      layout: {
        columns: 12,
        rows: 6,
        responsive: true,
      },
      widgets: [
        {
          id: 'widget-1',
          type: 'kpi',
          title: 'Sales Target',
          configuration: {
            dataSource: 'kpi-1',
            refreshInterval: 300000, // 5 minutes
            chartType: 'line',
          },
          position: { x: 0, y: 0, width: 4, height: 2 },
        },
        {
          id: 'widget-2',
          type: 'chart',
          title: 'Performance Trend',
          configuration: {
            dataSource: 'performance-trend',
            refreshInterval: 600000, // 10 minutes
            chartType: 'line',
            showLegend: true,
          },
          position: { x: 4, y: 0, width: 8, height: 4 },
        },
      ],
      filters: {
        timeRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly',
        },
      },
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.dashboards.set(mockDashboard.id, mockDashboard)
    this.userDashboards.set('user1', [mockDashboard.id])
  }

  async getDashboardConfiguration(userId: string, dashboardType?: string): Promise<Dashboard | null> {
    const userDashboardIds = this.userDashboards.get(userId) || []
    
    if (userDashboardIds.length === 0) {
      return null
    }

    // Return the first dashboard (or default dashboard)
    const dashboardId = userDashboardIds[0]
    return this.dashboards.get(dashboardId) || null
  }

  async saveDashboardConfiguration(configuration: Dashboard): Promise<Dashboard> {
    configuration.updatedAt = new Date().toISOString()
    this.dashboards.set(configuration.id, configuration)
    
    // Update user dashboard mapping
    const userDashboards = this.userDashboards.get(configuration.userId) || []
    if (!userDashboards.includes(configuration.id)) {
      userDashboards.push(configuration.id)
      this.userDashboards.set(configuration.userId, userDashboards)
    }
    
    return configuration
  }

  async getDefaultDashboardTemplate(userRole: string): Promise<Dashboard> {
    // Return a template based on user role
    const template: Dashboard = {
      id: `template-${userRole}`,
      userId: '',
      name: `${userRole} Dashboard Template`,
      description: `Default dashboard template for ${userRole}`,
      layout: {
        columns: 12,
        rows: 6,
        responsive: true,
      },
      widgets: this.getDefaultWidgetsForRole(userRole),
      filters: {
        timeRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly',
        },
      },
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return template
  }

  async getDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    const dashboard = this.dashboards.get(dashboardId)
    return dashboard?.widgets || []
  }

  async updateWidget(dashboardId: string, widget: DashboardWidget): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId)
    if (dashboard) {
      const widgetIndex = dashboard.widgets.findIndex(w => w.id === widget.id)
      if (widgetIndex >= 0) {
        dashboard.widgets[widgetIndex] = widget
      } else {
        dashboard.widgets.push(widget)
      }
      dashboard.updatedAt = new Date().toISOString()
      this.dashboards.set(dashboardId, dashboard)
    }
  }

  async removeWidget(dashboardId: string, widgetId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId)
    if (dashboard) {
      dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId)
      dashboard.updatedAt = new Date().toISOString()
      this.dashboards.set(dashboardId, dashboard)
    }
  }

  private getDefaultWidgetsForRole(role: string): DashboardWidget[] {
    const baseWidgets: DashboardWidget[] = [
      {
        id: 'kpi-overview',
        type: 'kpi',
        title: 'KPI Overview',
        configuration: {
          dataSource: 'kpi-summary',
          refreshInterval: 300000,
        },
        position: { x: 0, y: 0, width: 6, height: 2 },
      },
    ]

    switch (role) {
      case 'executive':
        return [
          ...baseWidgets,
          {
            id: 'org-performance',
            type: 'chart',
            title: 'Organizational Performance',
            configuration: {
              dataSource: 'org-metrics',
              refreshInterval: 600000,
              chartType: 'heatmap',
            },
            position: { x: 6, y: 0, width: 6, height: 4 },
          },
        ]
      case 'supervisor':
        return [
          ...baseWidgets,
          {
            id: 'team-performance',
            type: 'chart',
            title: 'Team Performance',
            configuration: {
              dataSource: 'team-metrics',
              refreshInterval: 300000,
              chartType: 'bar',
            },
            position: { x: 6, y: 0, width: 6, height: 3 },
          },
        ]
      default:
        return baseWidgets
    }
  }
}

export const dashboardRepository = new DashboardRepository()