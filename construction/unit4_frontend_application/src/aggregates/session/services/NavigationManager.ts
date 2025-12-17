import { UserRole } from '../../../types/domain'

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: NavigationItem[]
  permissions?: string[]
  roles?: string[]
  badge?: string | number
  disabled?: boolean
}

export interface Breadcrumb {
  label: string
  path: string
  disabled?: boolean
}

export class NavigationManager {
  private readonly NAVIGATION_KEY = 'navigation_state'
  private readonly RECENT_PATHS_KEY = 'recent_paths'
  private readonly MAX_RECENT_PATHS = 10

  private navigationItems: NavigationItem[] = [
    // Employee: My Dashboard - view KPIs assigned, performance
    {
      id: 'dashboard',
      label: 'My Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      permissions: ['dashboard:read'],
    },
    // Employee: My KPIs - view assigned KPIs
    {
      id: 'my-kpis',
      label: 'My KPIs',
      path: '/my-kpis',
      icon: 'track_changes',
      permissions: ['kpi:read'],
      roles: ['employee'],
    },
    // Employee: Self-Evaluation
    {
      id: 'self-evaluation',
      label: 'Self-Evaluation',
      path: '/assessments/self',
      icon: 'rate_review',
      permissions: ['assessment:self'],
      roles: ['employee'],
    },
    // Supervisor: Team KPI Management - set/modify KPIs for employees
    {
      id: 'team-kpis',
      label: 'Team KPI Management',
      path: '/team-kpis',
      icon: 'tune',
      permissions: ['kpi:write', 'kpi:modify'],
      roles: ['supervisor'],
    },
    // Supervisor: Team Dashboard
    {
      id: 'team',
      label: 'Team Dashboard',
      path: '/team',
      icon: 'group',
      permissions: ['team:read'],
      roles: ['supervisor', 'manager'],
    },
    // HR: KPI Administration - set KPIs per employee, approve changes
    {
      id: 'kpi-admin',
      label: 'KPI Administration',
      path: '/kpi-admin',
      icon: 'admin_panel_settings',
      permissions: ['kpi:manage', 'kpi:approve'],
      roles: ['manager'],
    },
    // HR: KPI Approval Queue
    {
      id: 'kpi-approval',
      label: 'KPI Approvals',
      path: '/kpi-approval',
      icon: 'approval',
      permissions: ['kpi:approve'],
      roles: ['manager'],
    },
    // Executive: Reports & Statistics - view team performance reports
    {
      id: 'executive-reports',
      label: 'Executive Reports',
      path: '/executive',
      icon: 'business',
      permissions: ['reports:read', 'analytics:read'],
      roles: ['executive'],
    },
    // Assessments - available to all with different permissions
    {
      id: 'assessments',
      label: 'Assessments',
      path: '/assessments',
      icon: 'assessment',
      permissions: ['assessment:read'],
    },
    // Feedback - available to all
    {
      id: 'feedback',
      label: 'Feedback',
      path: '/feedback',
      icon: 'feedback',
      permissions: ['feedback:read'],
    },
    // Reports section
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: 'analytics',
      permissions: ['reports:read'],
      children: [
        {
          id: 'my-performance',
          label: 'My Performance',
          path: '/reports/my-performance',
          permissions: ['reports:read'],
          roles: ['employee'],
        },
        {
          id: 'team-reports',
          label: 'Team Reports',
          path: '/reports/team',
          permissions: ['reports:read'],
          roles: ['supervisor', 'manager'],
        },
        {
          id: 'org-analytics',
          label: 'Organization Analytics',
          path: '/reports/analytics',
          permissions: ['analytics:read'],
          roles: ['executive'],
        },
      ],
    },
    // Settings - available to all
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: 'settings',
      children: [
        {
          id: 'profile',
          label: 'Profile',
          path: '/settings/profile',
        },
        {
          id: 'preferences',
          label: 'Preferences',
          path: '/settings/preferences',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          path: '/settings/notifications',
        },
      ],
    },
  ]

  /**
   * Get navigation items filtered by user permissions
   */
  getNavigationItems(userPermissions: string[], userRole: string): NavigationItem[] {
    return this.filterNavigationItems(this.navigationItems, userPermissions, userRole)
  }

  /**
   * Get breadcrumbs for current path
   */
  getBreadcrumbs(currentPath: string): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', path: '/' }
    ]

    const pathSegments = currentPath.split('/').filter(segment => segment)
    let currentSegmentPath = ''

    for (const segment of pathSegments) {
      currentSegmentPath += `/${segment}`
      const item = this.findNavigationItem(currentSegmentPath)
      
      if (item) {
        breadcrumbs.push({
          label: item.label,
          path: currentSegmentPath,
          disabled: currentSegmentPath === currentPath,
        })
      } else {
        // Generate breadcrumb from path segment
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        breadcrumbs.push({
          label,
          path: currentSegmentPath,
          disabled: currentSegmentPath === currentPath,
        })
      }
    }

    return breadcrumbs
  }

  /**
   * Check if user can access a path
   */
  canAccessPath(path: string, userPermissions: string[], userRole: string): boolean {
    const item = this.findNavigationItem(path)
    if (!item) return true // Allow access to unknown paths by default

    return this.hasAccess(item, userPermissions, userRole)
  }

  /**
   * Get default path for user role
   */
  getDefaultPath(userRole: string): string {
    switch (userRole) {
      case 'executive':
        return '/executive'
      case 'manager':
      case 'supervisor':
        return '/team'
      default:
        return '/dashboard'
    }
  }

  /**
   * Add recent path
   */
  addRecentPath(path: string, label?: string): void {
    try {
      const recentPaths = this.getRecentPaths()
      const newPath = { path, label: label || this.getPathLabel(path), timestamp: Date.now() }
      
      // Remove existing entry if present
      const filtered = recentPaths.filter(p => p.path !== path)
      
      // Add to beginning and limit to max
      const updated = [newPath, ...filtered].slice(0, this.MAX_RECENT_PATHS)
      
      localStorage.setItem(this.RECENT_PATHS_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to add recent path:', error)
    }
  }

  /**
   * Get recent paths
   */
  getRecentPaths(): Array<{ path: string; label: string; timestamp: number }> {
    try {
      const stored = localStorage.getItem(this.RECENT_PATHS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  /**
   * Clear recent paths
   */
  clearRecentPaths(): void {
    localStorage.removeItem(this.RECENT_PATHS_KEY)
  }

  /**
   * Get navigation state
   */
  getNavigationState(): {
    currentPath: string
    previousPath: string | null
    isCollapsed: boolean
  } {
    try {
      const stored = localStorage.getItem(this.NAVIGATION_KEY)
      return stored ? JSON.parse(stored) : {
        currentPath: '/',
        previousPath: null,
        isCollapsed: false,
      }
    } catch (error) {
      return {
        currentPath: '/',
        previousPath: null,
        isCollapsed: false,
      }
    }
  }

  /**
   * Save navigation state
   */
  saveNavigationState(state: {
    currentPath: string
    previousPath: string | null
    isCollapsed: boolean
  }): void {
    try {
      localStorage.setItem(this.NAVIGATION_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save navigation state:', error)
    }
  }

  /**
   * Get quick actions for current context
   */
  getQuickActions(currentPath: string, userPermissions: string[]): NavigationItem[] {
    const quickActions: NavigationItem[] = []

    // Context-specific quick actions
    if (currentPath.startsWith('/dashboard')) {
      if (userPermissions.includes('dashboard:customize')) {
        quickActions.push({
          id: 'customize-dashboard',
          label: 'Customize Dashboard',
          path: '/dashboard/customize',
          icon: 'tune',
        })
      }
    }

    if (currentPath.startsWith('/assessments')) {
      if (userPermissions.includes('assessment:create')) {
        quickActions.push({
          id: 'new-assessment',
          label: 'New Assessment',
          path: '/assessments/new',
          icon: 'add',
        })
      }
    }

    if (currentPath.startsWith('/feedback')) {
      if (userPermissions.includes('feedback:create')) {
        quickActions.push({
          id: 'new-feedback',
          label: 'Give Feedback',
          path: '/feedback/new',
          icon: 'add_comment',
        })
      }
    }

    // Global quick actions
    quickActions.push(
      {
        id: 'search',
        label: 'Search',
        path: '/search',
        icon: 'search',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/notifications',
        icon: 'notifications',
      }
    )

    return quickActions
  }

  /**
   * Get page title for path
   */
  getPageTitle(path: string): string {
    const item = this.findNavigationItem(path)
    if (item) {
      return item.label
    }

    // Generate title from path
    const segments = path.split('/').filter(segment => segment)
    if (segments.length === 0) return 'Home'
    
    const lastSegment = segments[segments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
  }

  /**
   * Private helper methods
   */
  private filterNavigationItems(
    items: NavigationItem[],
    userPermissions: string[],
    userRole: string
  ): NavigationItem[] {
    return items
      .filter(item => this.hasAccess(item, userPermissions, userRole))
      .map(item => ({
        ...item,
        children: item.children 
          ? this.filterNavigationItems(item.children, userPermissions, userRole)
          : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0)
  }

  private hasAccess(
    item: NavigationItem,
    userPermissions: string[],
    userRole: string
  ): boolean {
    // Check role-based access
    if (item.roles && item.roles.length > 0) {
      if (!item.roles.includes(userRole)) {
        return false
      }
    }

    // Check permission-based access
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some(permission => userPermissions.includes(permission))
    }

    return true
  }

  private findNavigationItem(path: string): NavigationItem | null {
    const findInItems = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.path === path) {
          return item
        }
        if (item.children) {
          const found = findInItems(item.children)
          if (found) return found
        }
      }
      return null
    }

    return findInItems(this.navigationItems)
  }

  private getPathLabel(path: string): string {
    const item = this.findNavigationItem(path)
    return item ? item.label : this.getPageTitle(path)
  }
}