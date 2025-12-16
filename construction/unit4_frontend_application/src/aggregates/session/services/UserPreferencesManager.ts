import { UserPreferences, NotificationPreferences, DashboardPreferences } from '../../../types/domain'

export class UserPreferencesManager {
  private readonly STORAGE_KEY = 'user_preferences'
  private readonly THEME_KEY = 'theme_preference'
  private readonly LANGUAGE_KEY = 'language_preference'

  private defaultPreferences: UserPreferences = {
    theme: 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    notifications: {
      email: true,
      push: true,
      inApp: true,
      frequency: 'immediate',
    },
    dashboard: {
      defaultView: 'personal',
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
    },
  }

  /**
   * Load user preferences from storage
   */
  loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const preferences = JSON.parse(stored)
        return this.mergeWithDefaults(preferences)
      }
      return this.defaultPreferences
    } catch (error) {
      console.error('Failed to load preferences:', error)
      return this.defaultPreferences
    }
  }

  /**
   * Save user preferences to storage
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences))
      
      // Also store theme separately for quick access
      localStorage.setItem(this.THEME_KEY, preferences.theme)
      localStorage.setItem(this.LANGUAGE_KEY, preferences.language)

      // In real app, would sync with backend
      await this.syncWithBackend(preferences)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      throw new Error('Failed to save preferences')
    }
  }

  /**
   * Update specific preference section
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const current = this.loadPreferences()
      const updated = { ...current, ...updates }
      
      await this.savePreferences(updated)
      return updated
    } catch (error) {
      throw new Error('Failed to update preferences')
    }
  }

  /**
   * Update theme preference
   */
  async updateTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    try {
      const preferences = this.loadPreferences()
      preferences.theme = theme
      await this.savePreferences(preferences)
      
      // Apply theme immediately
      this.applyTheme(theme)
    } catch (error) {
      throw new Error('Failed to update theme')
    }
  }

  /**
   * Update language preference
   */
  async updateLanguage(language: string): Promise<void> {
    try {
      const preferences = this.loadPreferences()
      preferences.language = language
      await this.savePreferences(preferences)
    } catch (error) {
      throw new Error('Failed to update language')
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(notifications: Partial<NotificationPreferences>): Promise<void> {
    try {
      const preferences = this.loadPreferences()
      preferences.notifications = { ...preferences.notifications, ...notifications }
      await this.savePreferences(preferences)
    } catch (error) {
      throw new Error('Failed to update notification preferences')
    }
  }

  /**
   * Update dashboard preferences
   */
  async updateDashboardPreferences(dashboard: Partial<DashboardPreferences>): Promise<void> {
    try {
      const preferences = this.loadPreferences()
      preferences.dashboard = { ...preferences.dashboard, ...dashboard }
      await this.savePreferences(preferences)
    } catch (error) {
      throw new Error('Failed to update dashboard preferences')
    }
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(): Promise<UserPreferences> {
    try {
      await this.savePreferences(this.defaultPreferences)
      return this.defaultPreferences
    } catch (error) {
      throw new Error('Failed to reset preferences')
    }
  }

  /**
   * Get theme preference quickly
   */
  getTheme(): 'light' | 'dark' | 'auto' {
    try {
      const theme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | 'auto'
      return theme || this.defaultPreferences.theme
    } catch (error) {
      return this.defaultPreferences.theme
    }
  }

  /**
   * Get language preference quickly
   */
  getLanguage(): string {
    try {
      return localStorage.getItem(this.LANGUAGE_KEY) || this.defaultPreferences.language
    } catch (error) {
      return this.defaultPreferences.language
    }
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    try {
      const root = document.documentElement
      
      if (theme === 'auto') {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      } else {
        root.setAttribute('data-theme', theme)
      }
    } catch (error) {
      console.error('Failed to apply theme:', error)
    }
  }

  /**
   * Initialize preferences manager
   */
  initialize(): UserPreferences {
    const preferences = this.loadPreferences()
    
    // Apply theme on initialization
    this.applyTheme(preferences.theme)
    
    // Listen for system theme changes if using auto theme
    if (preferences.theme === 'auto') {
      this.setupSystemThemeListener()
    }
    
    return preferences
  }

  /**
   * Export preferences for backup
   */
  exportPreferences(): string {
    const preferences = this.loadPreferences()
    return JSON.stringify(preferences, null, 2)
  }

  /**
   * Import preferences from backup
   */
  async importPreferences(preferencesJson: string): Promise<UserPreferences> {
    try {
      const preferences = JSON.parse(preferencesJson)
      const validated = this.validatePreferences(preferences)
      await this.savePreferences(validated)
      return validated
    } catch (error) {
      throw new Error('Invalid preferences format')
    }
  }

  /**
   * Get available timezones
   */
  getAvailableTimezones(): string[] {
    return [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
    ]
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' },
      { code: 'ja', name: '日本語' },
      { code: 'zh', name: '中文' },
    ]
  }

  /**
   * Private helper methods
   */
  private mergeWithDefaults(preferences: Partial<UserPreferences>): UserPreferences {
    return {
      theme: preferences.theme || this.defaultPreferences.theme,
      language: preferences.language || this.defaultPreferences.language,
      timezone: preferences.timezone || this.defaultPreferences.timezone,
      notifications: {
        ...this.defaultPreferences.notifications,
        ...preferences.notifications,
      },
      dashboard: {
        ...this.defaultPreferences.dashboard,
        ...preferences.dashboard,
      },
    }
  }

  private validatePreferences(preferences: any): UserPreferences {
    // Basic validation - in real app, would use a schema validator
    const validated: UserPreferences = {
      theme: ['light', 'dark', 'auto'].includes(preferences.theme) 
        ? preferences.theme 
        : this.defaultPreferences.theme,
      language: typeof preferences.language === 'string' 
        ? preferences.language 
        : this.defaultPreferences.language,
      timezone: typeof preferences.timezone === 'string' 
        ? preferences.timezone 
        : this.defaultPreferences.timezone,
      notifications: {
        email: typeof preferences.notifications?.email === 'boolean' 
          ? preferences.notifications.email 
          : this.defaultPreferences.notifications.email,
        push: typeof preferences.notifications?.push === 'boolean' 
          ? preferences.notifications.push 
          : this.defaultPreferences.notifications.push,
        inApp: typeof preferences.notifications?.inApp === 'boolean' 
          ? preferences.notifications.inApp 
          : this.defaultPreferences.notifications.inApp,
        frequency: ['immediate', 'daily', 'weekly'].includes(preferences.notifications?.frequency) 
          ? preferences.notifications.frequency 
          : this.defaultPreferences.notifications.frequency,
      },
      dashboard: {
        defaultView: ['personal', 'team', 'executive'].includes(preferences.dashboard?.defaultView) 
          ? preferences.dashboard.defaultView 
          : this.defaultPreferences.dashboard.defaultView,
        autoRefresh: typeof preferences.dashboard?.autoRefresh === 'boolean' 
          ? preferences.dashboard.autoRefresh 
          : this.defaultPreferences.dashboard.autoRefresh,
        refreshInterval: typeof preferences.dashboard?.refreshInterval === 'number' 
          ? preferences.dashboard.refreshInterval 
          : this.defaultPreferences.dashboard.refreshInterval,
      },
    }

    return validated
  }

  private async syncWithBackend(preferences: UserPreferences): Promise<void> {
    try {
      // Mock backend sync - in real app, would make API call
      console.log('Syncing preferences with backend:', preferences)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to sync preferences with backend:', error)
      // Don't throw error - local storage is still updated
    }
  }

  private setupSystemThemeListener(): void {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        const preferences = this.loadPreferences()
        if (preferences.theme === 'auto') {
          this.applyTheme('auto')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
    } catch (error) {
      console.error('Failed to setup system theme listener:', error)
    }
  }
}