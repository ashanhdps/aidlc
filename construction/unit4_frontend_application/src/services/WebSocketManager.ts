export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
  id: string
}

export interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void

export class WebSocketManager {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map()
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnecting = false
  private isManuallyDisconnected = false

  // Mock mode for development
  private mockMode = true
  private mockTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080/ws',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.mockMode) {
      return this.startMockMode()
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    try {
      this.isConnecting = true
      this.isManuallyDisconnected = false

      this.ws = new WebSocket(this.config.url)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'))
        }, 10000)

        this.ws!.onopen = (event) => {
          clearTimeout(timeout)
          this.handleOpen(event)
          resolve()
        }

        this.ws!.onerror = (event) => {
          clearTimeout(timeout)
          this.handleError(event)
          reject(new Error('WebSocket connection failed'))
        }
      })
    } catch (error) {
      this.isConnecting = false
      throw error
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManuallyDisconnected = true
    
    if (this.mockMode) {
      this.stopMockMode()
      return
    }

    this.clearTimers()

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
  }

  /**
   * Send message to server
   */
  send(type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    }

    if (this.mockMode) {
      console.log('Mock WebSocket send:', message)
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  /**
   * Subscribe to specific message types
   */
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  /**
   * Unsubscribe from message types
   */
  off(eventType: string, handler?: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      return
    }

    if (handler) {
      const handlers = this.eventHandlers.get(eventType)!
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.eventHandlers.delete(eventType)
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean
    connecting: boolean
    reconnectAttempts: number
    mockMode: boolean
  } {
    return {
      connected: this.mockMode || this.ws?.readyState === WebSocket.OPEN,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      mockMode: this.mockMode,
    }
  }

  /**
   * Enable/disable mock mode
   */
  setMockMode(enabled: boolean): void {
    if (this.mockMode === enabled) return

    if (this.mockMode && !enabled) {
      this.stopMockMode()
    } else if (!this.mockMode && enabled) {
      this.disconnect()
    }

    this.mockMode = enabled

    if (enabled) {
      this.startMockMode()
    }
  }

  /**
   * Private event handlers
   */
  private handleOpen(event: Event): void {
    console.log('WebSocket connected')
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.startHeartbeat()
    this.emit('connection', { status: 'connected' })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.emit(message.type, message.payload)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason)
    this.isConnecting = false
    this.clearTimers()
    this.emit('connection', { status: 'disconnected', code: event.code, reason: event.reason })

    // Attempt reconnection if not manually disconnected
    if (!this.isManuallyDisconnected && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event)
    this.emit('connection', { status: 'error', event })
  }

  /**
   * Reconnection logic
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000)

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        console.error('Reconnect failed:', error)
      }
    }, delay)
  }

  /**
   * Heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Mock mode for development
   */
  private startMockMode(): void {
    console.log('Starting WebSocket mock mode')
    this.emit('connection', { status: 'connected', mock: true })

    // Simulate periodic updates
    this.mockTimer = setInterval(() => {
      this.generateMockEvents()
    }, 5000)
  }

  private stopMockMode(): void {
    console.log('Stopping WebSocket mock mode')
    if (this.mockTimer) {
      clearInterval(this.mockTimer)
      this.mockTimer = null
    }
    this.emit('connection', { status: 'disconnected', mock: true })
  }

  private generateMockEvents(): void {
    const mockEvents = [
      {
        type: 'kpi-updated',
        payload: {
          kpiId: 'kpi-1',
          value: Math.random() * 100,
          timestamp: new Date().toISOString(),
        },
      },
      {
        type: 'notification',
        payload: {
          id: this.generateMessageId(),
          title: 'New Feedback',
          message: 'You have received new feedback on your performance',
          type: 'feedback',
          priority: 'medium',
        },
      },
      {
        type: 'user-activity',
        payload: {
          userId: 'user-1',
          action: 'dashboard-view',
          timestamp: new Date().toISOString(),
        },
      },
      {
        type: 'system-status',
        payload: {
          status: 'healthy',
          uptime: Math.floor(Math.random() * 86400),
          activeUsers: Math.floor(Math.random() * 100),
        },
      },
    ]

    // Randomly emit one of the mock events
    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)]
    this.emit(randomEvent.type, randomEvent.payload)
  }

  /**
   * Utility methods
   */
  private emit(eventType: string, payload: any): void {
    const handlers = this.eventHandlers.get(eventType) || []
    const message: WebSocketMessage = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    }

    handlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error(`Error in WebSocket event handler for ${eventType}:`, error)
      }
    })
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.mockTimer) {
      clearInterval(this.mockTimer)
      this.mockTimer = null
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disconnect()
    this.eventHandlers.clear()
  }
}

// Singleton instance
export const webSocketManager = new WebSocketManager()