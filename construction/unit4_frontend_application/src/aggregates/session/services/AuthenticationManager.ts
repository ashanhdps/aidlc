import { UserProfile, AuthState } from '../../../types/domain'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface AuthResponse {
  user: UserProfile
  tokens: AuthTokens
}

export class AuthenticationManager {
  private readonly STORAGE_KEY = 'auth_session'
  private readonly TOKEN_KEY = 'auth_token'
  private readonly REFRESH_KEY = 'refresh_token'
  private readonly USER_KEY = 'user_profile'

  private refreshTimer: NodeJS.Timeout | null = null

  /**
   * Authenticate user with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Mock authentication - in real app, this would be an API call
      const mockUser: UserProfile = {
        id: 'user-1',
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        role: {
          id: 'role-1',
          name: 'employee',
          permissions: ['dashboard:read', 'assessment:write', 'feedback:read', 'feedback:write'],
        },
        department: 'Engineering',
        permissions: ['dashboard:read', 'assessment:write', 'feedback:read', 'feedback:write'],
        avatar: undefined,
      }

      const tokens: AuthTokens = {
        accessToken: this.generateMockToken(),
        refreshToken: this.generateMockToken(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      }

      // Store tokens if remember me is enabled
      if (credentials.rememberMe) {
        this.storeTokens(tokens, mockUser)
      }

      // Set up token refresh
      this.scheduleTokenRefresh(tokens.expiresAt)

      return {
        user: mockUser,
        tokens,
      }
    } catch (error) {
      throw new Error('Authentication failed')
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      // Clear stored tokens
      this.clearStoredTokens()
      
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }

      // In real app, would call logout API endpoint
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Mock token refresh - in real app, this would be an API call
      const newTokens: AuthTokens = {
        accessToken: this.generateMockToken(),
        refreshToken: refreshToken, // Keep same refresh token
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      }

      // Update stored tokens
      const storedUser = this.getStoredUser()
      if (storedUser) {
        this.storeTokens(newTokens, storedUser)
      }

      // Schedule next refresh
      this.scheduleTokenRefresh(newTokens.expiresAt)

      return newTokens
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }

  /**
   * Validate current token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Mock validation - in real app, this would verify with backend
      const storedToken = localStorage.getItem(this.TOKEN_KEY)
      return storedToken === token && !this.isTokenExpired()
    } catch (error) {
      return false
    }
  }

  /**
   * Get stored authentication state
   */
  getStoredAuthState(): AuthState | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY)
      const refreshToken = localStorage.getItem(this.REFRESH_KEY)
      const user = this.getStoredUser()

      if (token && user && !this.isTokenExpired()) {
        return {
          isAuthenticated: true,
          token,
          refreshToken,
          expiresAt: this.getTokenExpiry(),
          user,
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY)
    return !!token && !this.isTokenExpired()
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): UserProfile | null {
    return this.getStoredUser()
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const currentUser = this.getStoredUser()
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      const updatedUser = { ...currentUser, ...updates }
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      throw new Error('Profile update failed')
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Mock password change - in real app, this would be an API call
      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Password changed successfully')
    } catch (error) {
      throw new Error('Password change failed')
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Mock password reset request - in real app, this would be an API call
      console.log(`Password reset requested for ${email}`)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      throw new Error('Password reset request failed')
    }
  }

  /**
   * Private helper methods
   */
  private generateMockToken(): string {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private storeTokens(tokens: AuthTokens, user: UserProfile): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_KEY, tokens.refreshToken)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    localStorage.setItem('token_expiry', tokens.expiresAt)
  }

  private clearStoredTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_KEY)
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem('token_expiry')
  }

  private getStoredUser(): UserProfile | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY)
      return userJson ? JSON.parse(userJson) : null
    } catch (error) {
      return null
    }
  }

  private isTokenExpired(): boolean {
    const expiry = localStorage.getItem('token_expiry')
    if (!expiry) return true
    
    return new Date(expiry) <= new Date()
  }

  private getTokenExpiry(): string | null {
    return localStorage.getItem('token_expiry')
  }

  private scheduleTokenRefresh(expiresAt: string): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    const refreshTime = expiryTime - currentTime - 300000 // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          const refreshToken = localStorage.getItem(this.REFRESH_KEY)
          if (refreshToken) {
            await this.refreshToken(refreshToken)
          }
        } catch (error) {
          console.error('Auto token refresh failed:', error)
        }
      }, refreshTime)
    }
  }

  /**
   * Initialize authentication manager
   */
  initialize(): void {
    // Check for existing session and set up refresh if needed
    const authState = this.getStoredAuthState()
    if (authState && authState.expiresAt) {
      this.scheduleTokenRefresh(authState.expiresAt)
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }
}