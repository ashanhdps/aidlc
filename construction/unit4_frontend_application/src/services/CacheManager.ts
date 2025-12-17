export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL = 300000 // 5 minutes
  private maxSize = 1000
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL
    this.maxSize = options.maxSize || this.maxSize
    
    // Start cleanup interval
    this.startCleanup()
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const storage = options.storage || 'memory'
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    }

    switch (storage) {
      case 'memory':
        this.setMemoryCache(key, entry)
        break
      case 'localStorage':
        this.setLocalStorageCache(key, entry)
        break
      case 'sessionStorage':
        this.setSessionStorageCache(key, entry)
        break
    }
  }

  /**
   * Get cache entry
   */
  get<T>(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): T | null {
    switch (storage) {
      case 'memory':
        return this.getMemoryCache<T>(key)
      case 'localStorage':
        return this.getLocalStorageCache<T>(key)
      case 'sessionStorage':
        return this.getSessionStorageCache<T>(key)
      default:
        return null
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): boolean {
    return this.get(key, storage) !== null
  }

  /**
   * Delete cache entry
   */
  delete(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): boolean {
    switch (storage) {
      case 'memory':
        return this.memoryCache.delete(key)
      case 'localStorage':
        try {
          localStorage.removeItem(this.getStorageKey(key))
          return true
        } catch {
          return false
        }
      case 'sessionStorage':
        try {
          sessionStorage.removeItem(this.getStorageKey(key))
          return true
        } catch {
          return false
        }
      default:
        return false
    }
  }

  /**
   * Clear all cache entries
   */
  clear(storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    switch (storage) {
      case 'memory':
        this.memoryCache.clear()
        break
      case 'localStorage':
        this.clearStorageCache('localStorage')
        break
      case 'sessionStorage':
        this.clearStorageCache('sessionStorage')
        break
    }
  }

  /**
   * Get or set cache entry with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    const storage = options.storage || 'memory'
    
    // Try to get from cache first
    const cached = this.get<T>(key, storage)
    if (cached !== null) {
      return cached
    }

    // Generate new data
    const data = await factory()
    
    // Store in cache
    this.set(key, data, options)
    
    return data
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    const regex = new RegExp(pattern)
    
    switch (storage) {
      case 'memory':
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key)
          }
        }
        break
      case 'localStorage':
        this.invalidateStoragePattern(regex, 'localStorage')
        break
      case 'sessionStorage':
        this.invalidateStoragePattern(regex, 'sessionStorage')
        break
    }
  }

  /**
   * Get cache statistics
   */
  getStats(storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): {
    size: number
    hitRate?: number
    memoryUsage?: number
  } {
    switch (storage) {
      case 'memory':
        return {
          size: this.memoryCache.size,
          memoryUsage: this.calculateMemoryUsage(),
        }
      case 'localStorage':
      case 'sessionStorage':
        return {
          size: this.getStorageSize(storage),
        }
      default:
        return { size: 0 }
    }
  }

  /**
   * Preload cache with data
   */
  async preload<T>(entries: Array<{ key: string; factory: () => Promise<T> | T; options?: CacheOptions }>): Promise<void> {
    const promises = entries.map(async ({ key, factory, options = {} }) => {
      try {
        const data = await factory()
        this.set(key, data, options)
      } catch (error) {
        console.error(`Failed to preload cache entry ${key}:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Export cache data
   */
  export(storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): Record<string, any> {
    const exported: Record<string, any> = {}

    switch (storage) {
      case 'memory':
        for (const [key, entry] of this.memoryCache.entries()) {
          if (!this.isExpired(entry)) {
            exported[key] = entry.data
          }
        }
        break
      case 'localStorage':
      case 'sessionStorage':
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
        for (let i = 0; i < storageObj.length; i++) {
          const key = storageObj.key(i)
          if (key?.startsWith('cache_')) {
            const cacheKey = key.substring(6)
            const data = this.get(cacheKey, storage)
            if (data !== null) {
              exported[cacheKey] = data
            }
          }
        }
        break
    }

    return exported
  }

  /**
   * Import cache data
   */
  import(data: Record<string, any>, options: CacheOptions = {}): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, options)
    })
  }

  /**
   * Private methods for memory cache
   */
  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    // Check size limit
    if (this.memoryCache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.memoryCache.set(key, entry)
  }

  private getMemoryCache<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    
    if (!entry) {
      return null
    }

    if (this.isExpired(entry)) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Private methods for localStorage/sessionStorage
   */
  private setLocalStorageCache<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry))
    } catch (error) {
      console.error('Failed to set localStorage cache:', error)
    }
  }

  private setSessionStorageCache<T>(key: string, entry: CacheEntry<T>): void {
    try {
      sessionStorage.setItem(this.getStorageKey(key), JSON.stringify(entry))
    } catch (error) {
      console.error('Failed to set sessionStorage cache:', error)
    }
  }

  private getLocalStorageCache<T>(key: string): T | null {
    return this.getStorageCache<T>(key, 'localStorage')
  }

  private getSessionStorageCache<T>(key: string): T | null {
    return this.getStorageCache<T>(key, 'sessionStorage')
  }

  private getStorageCache<T>(key: string, storage: 'localStorage' | 'sessionStorage'): T | null {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const item = storageObj.getItem(this.getStorageKey(key))
      
      if (!item) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(item)
      
      if (this.isExpired(entry)) {
        storageObj.removeItem(this.getStorageKey(key))
        return null
      }

      return entry.data
    } catch (error) {
      console.error(`Failed to get ${storage} cache:`, error)
      return null
    }
  }

  /**
   * Utility methods
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private getStorageKey(key: string): string {
    return `cache_${key}`
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
    }
  }

  private clearStorageCache(storage: 'localStorage' | 'sessionStorage'): void {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const keysToRemove: string[] = []

      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i)
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => storageObj.removeItem(key))
    } catch (error) {
      console.error(`Failed to clear ${storage} cache:`, error)
    }
  }

  private invalidateStoragePattern(regex: RegExp, storage: 'localStorage' | 'sessionStorage'): void {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const keysToRemove: string[] = []

      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i)
        if (key?.startsWith('cache_')) {
          const cacheKey = key.substring(6)
          if (regex.test(cacheKey)) {
            keysToRemove.push(key)
          }
        }
      }

      keysToRemove.forEach(key => storageObj.removeItem(key))
    } catch (error) {
      console.error(`Failed to invalidate ${storage} cache pattern:`, error)
    }
  }

  private getStorageSize(storage: 'localStorage' | 'sessionStorage'): number {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      let count = 0

      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i)
        if (key?.startsWith('cache_')) {
          count++
        }
      }

      return count
    } catch (error) {
      return 0
    }
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0
    
    for (const entry of this.memoryCache.values()) {
      // Rough estimation of memory usage
      totalSize += JSON.stringify(entry).length * 2 // UTF-16 encoding
    }
    
    return totalSize
  }

  private startCleanup(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 300000)
  }

  private cleanup(): void {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key)
      }
    }

    // Clean localStorage cache
    this.cleanupStorage('localStorage')
    
    // Clean sessionStorage cache
    this.cleanupStorage('sessionStorage')
  }

  private cleanupStorage(storage: 'localStorage' | 'sessionStorage'): void {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const keysToRemove: string[] = []

      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i)
        if (key?.startsWith('cache_')) {
          const item = storageObj.getItem(key)
          if (item) {
            try {
              const entry: CacheEntry<any> = JSON.parse(item)
              if (this.isExpired(entry)) {
                keysToRemove.push(key)
              }
            } catch {
              // Invalid entry, remove it
              keysToRemove.push(key)
            }
          }
        }
      }

      keysToRemove.forEach(key => storageObj.removeItem(key))
    } catch (error) {
      console.error(`Failed to cleanup ${storage} cache:`, error)
    }
  }

  /**
   * Destroy cache manager and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    
    this.clear('memory')
  }
}

// Singleton instances for different use cases
export const globalCache = new CacheManager({ ttl: 300000, maxSize: 1000 }) // 5 minutes
export const sessionCache = new CacheManager({ ttl: 1800000, maxSize: 500 }) // 30 minutes
export const longTermCache = new CacheManager({ ttl: 3600000, maxSize: 200 }) // 1 hour