import { globalCache } from '../services/CacheManager'

export interface OfflineQueueItem {
  id: string
  action: string
  data: any
  timestamp: number
  retryCount: number
}

class OfflineManager {
  private static instance: OfflineManager
  private isOnline: boolean = navigator.onLine
  private queue: OfflineQueueItem[] = []
  private readonly QUEUE_KEY = 'offline_queue'
  private readonly MAX_RETRIES = 3

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  constructor() {
    this.loadQueue()
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error)
      this.queue = []
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.warn('Failed to save offline queue:', error)
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline
  }

  public queueAction(action: string, data: any): string {
    const item: OfflineQueueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }

    this.queue.push(item)
    this.saveQueue()
    
    return item.id
  }

  public async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return
    }

    const itemsToProcess = [...this.queue]
    
    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item)
        this.removeFromQueue(item.id)
      } catch (error) {
        item.retryCount++
        
        if (item.retryCount >= this.MAX_RETRIES) {
          console.error(`Failed to process offline action after ${this.MAX_RETRIES} retries:`, item)
          this.removeFromQueue(item.id)
        }
      }
    }

    this.saveQueue()
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    // This would typically dispatch the queued action
    // For now, we'll just log it
    console.log('Processing offline action:', item.action, item.data)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id)
  }

  public getQueueSize(): number {
    return this.queue.length
  }

  public clearQueue(): void {
    this.queue = []
    this.saveQueue()
  }
}

// Offline-aware data fetching
export async function fetchWithOfflineSupport<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    cacheTimeout?: number
    fallbackToCache?: boolean
  } = {}
): Promise<T> {
  const { cacheTimeout = 300000, fallbackToCache = true } = options
  const offlineManager = OfflineManager.getInstance()

  try {
    // Try to fetch fresh data if online
    if (offlineManager.getOnlineStatus()) {
      const data = await fetchFn()
      // Cache the fresh data
      globalCache.set(key, data, cacheTimeout)
      return data
    }
  } catch (error) {
    console.warn('Failed to fetch fresh data:', error)
  }

  // Fall back to cached data if offline or fetch failed
  if (fallbackToCache) {
    const cachedData = globalCache.get<T>(key)
    if (cachedData) {
      return cachedData
    }
  }

  throw new Error('No data available offline')
}

// Offline-aware mutation
export function mutateWithOfflineSupport(
  action: string,
  data: any,
  mutateFn?: () => Promise<void>
): Promise<string | void> {
  const offlineManager = OfflineManager.getInstance()

  if (offlineManager.getOnlineStatus() && mutateFn) {
    // Execute immediately if online
    return mutateFn()
  } else {
    // Queue for later if offline
    const queueId = offlineManager.queueAction(action, data)
    return Promise.resolve(queueId)
  }
}

export const offlineManager = OfflineManager.getInstance()