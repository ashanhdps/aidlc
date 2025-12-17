import { UserPreferences } from '../../types/domain'

class UserPreferencesRepository {
  private readonly STORAGE_KEY = 'user_preferences'
  private preferences: Map<string, UserPreferences> = new Map()

  constructor() {
    this.loadFromLocalStorage()
    this.initializeMockData()
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([userId, prefs]) => {
          this.preferences.set(userId, prefs as UserPreferences)
        })
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error)
    }
  }

  private saveToLocalStorage() {
    try {
      const data: Record<string, UserPreferences> = {}
      this.preferences.forEach((prefs, userId) => {
        data[userId] = prefs
      })
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:', error)
    }
  }

  private initializeMockData() {
    if (!this.preferences.has('user1')) {
      const defaultPreferences: UserPreferences = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
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
      this.preferences.set('user1', defaultPreferences)
      this.saveToLocalStorage()
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.preferences.get(userId) || null
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const existing = this.preferences.get(userId) || this.getDefaultPreferences('employee')
    const updated = { ...existing, ...preferences }
    
    this.preferences.set(userId, updated)
    this.saveToLocalStorage()
    
    return updated
  }

  getDefaultPreferences(userRole: string): UserPreferences {
    const basePreferences: UserPreferences = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        inApp: true,
        frequency: 'immediate',
      },
      dashboard: {
        defaultView: 'personal',
        autoRefresh: true,
        refreshInterval: 300000,
      },
    }

    // Customize based on role
    switch (userRole) {
      case 'executive':
        return {
          ...basePreferences,
          dashboard: {
            ...basePreferences.dashboard,
            defaultView: 'executive',
            refreshInterval: 600000, // 10 minutes
          },
        }
      case 'supervisor':
        return {
          ...basePreferences,
          dashboard: {
            ...basePreferences.dashboard,
            defaultView: 'team',
            refreshInterval: 300000, // 5 minutes
          },
        }
      default:
        return basePreferences
    }
  }

  async syncPreferencesWithServer(userId: string): Promise<void> {
    // In a real implementation, this would sync with the backend
    // For now, we'll just simulate the sync
    console.log(`Syncing preferences for user ${userId} with server`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In practice, this would:
    // 1. Fetch latest preferences from server
    // 2. Merge with local preferences
    // 3. Update local storage
    // 4. Return merged preferences
  }

  async resetToDefaults(userId: string, userRole: string): Promise<UserPreferences> {
    const defaultPrefs = this.getDefaultPreferences(userRole)
    this.preferences.set(userId, defaultPrefs)
    this.saveToLocalStorage()
    return defaultPrefs
  }

  async exportPreferences(userId: string): Promise<string> {
    const prefs = this.preferences.get(userId)
    if (!prefs) {
      throw new Error('User preferences not found')
    }
    return JSON.stringify(prefs, null, 2)
  }

  async importPreferences(userId: string, preferencesJson: string): Promise<UserPreferences> {
    try {
      const imported = JSON.parse(preferencesJson) as UserPreferences
      
      // Validate the imported preferences structure
      if (!this.validatePreferencesStructure(imported)) {
        throw new Error('Invalid preferences structure')
      }
      
      this.preferences.set(userId, imported)
      this.saveToLocalStorage()
      return imported
    } catch (error) {
      throw new Error(`Failed to import preferences: ${error}`)
    }
  }

  private validatePreferencesStructure(prefs: any): prefs is UserPreferences {
    return (
      typeof prefs === 'object' &&
      typeof prefs.theme === 'string' &&
      typeof prefs.language === 'string' &&
      typeof prefs.timezone === 'string' &&
      typeof prefs.notifications === 'object' &&
      typeof prefs.dashboard === 'object'
    )
  }
}

export const userPreferencesRepository = new UserPreferencesRepository()