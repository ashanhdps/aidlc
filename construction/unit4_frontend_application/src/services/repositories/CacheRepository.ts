import { CacheEntry, CachePolicy } from '../../types/api'

class CacheRepository {
  private memoryCache: Map<string, CacheEntry> = new Map()
  private readonly DEFAULT_TTL = 300000 // 5 minutes
  private readonly MAX_MEMORY_ENTRIES = 1000
  private cachePolicy: CachePolicy = {
    ttl: this.DEFAULT_TTL,
    maxSize: this.MAX_MEMORY_ENTRIES,
    strategy: 'lru',
  }

  constructor() {
    this.startCleanupInterval()
  }

  async getCachedData(key: string, maxAge?: number): Promise<any | null> {
    // Try memory cache first
    const memoryEntry = this.getFromMemoryCache(key, maxAge)
    if (memoryEntry) {
      return memoryEntry
    }

    // Try session storage
    const sessionEntry = this.getFromSessionStorage(key, maxAge)
    if (sessionEntry) {
      // Promote to memory cache
      this.setMemoryCache(key, sessionEntry, maxAge || this.DEFAULT_TTL)
      return sessionEntry
    }

    // Try IndexedDB
    const indexedDBEntry = await this.getFromIndexedDB(key, maxAge)
    if (indexedDBEntry) {
      // Promote to higher-level caches
      this.setMemoryCache(key, indexedDBEntry, maxAge || this.DEFAULT_TTL)
      this.setSessionStorage(key, indexedDBEntry, maxAge || this.DEFAULT_TTL)
      return indexedDBEntry
    }

    return null
  }

  async setCachedData(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    // Store in all cache levels
    this.setMemoryCache(key, data, ttl)
    this.setSessionStorage(key, data, ttl)
    await this.setIndexedDB(key, data, ttl)
  }

  async invalidateCache(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('cache_') && regex.test(key.substring(6))) {
        sessionStorage.removeItem(key)
      }
    }

    // Clear IndexedDB
    await this.clearIndexedDBPattern(pattern)
  }

  getCacheStatistics(): {
    memoryEntries: number
    memoryHitRate: number
    sessionEntries: number
    totalSize: number
  } {
    let sessionEntries = 0
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('cache_')) {
        sessionEntries++
      }
    }

    return {
      memoryEntries: this.memoryCache.size,
      memoryHitRate: 0.85, // Mock hit rate
      sessionEntries,
      totalSize: this.calculateTotalSize(),
    }
  }

  private getFromMemoryCache(key: string, maxAge?: number): any | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    const ttl = maxAge || entry.ttl

    if (age > ttl) {
      this.memoryCache.delete(key)
      return null
    }

    // Update access time for LRU
    entry.timestamp = Date.now()
    this.memoryCache.set(key, entry)

    return entry.data
  }

  private setMemoryCache(key: string, data: any, ttl: number): void {
    if (this.memoryCache.size >= this.MAX_MEMORY_ENTRIES) {
      this.evictOldestEntry()
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    }

    this.memoryCache.set(key, entry)
  }

  private getFromSessionStorage(key: string, maxAge?: number): any | null {
    try {
      const item = sessionStorage.getItem(`cache_${key}`)
      if (!item) return null

      const entry = JSON.parse(item) as CacheEntry
      const age = Date.now() - entry.timestamp
      const ttl = maxAge || entry.ttl

      if (age > ttl) {
        sessionStorage.removeItem(`cache_${key}`)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Session storage cache retrieval failed:', error)
      return null
    }
  }

  private setSessionStorage(key: string, data: any, ttl: number): void {
    try {
      const entry: CacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      }
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry))
    } catch (error) {
      console.warn('Session storage cache failed:', error)
    }
  }

  private async getFromIndexedDB(key: string, maxAge?: number): Promise<any | null> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        
        request.onsuccess = () => {
          const entry = request.result as CacheEntry
          if (!entry) {
            resolve(null)
            return
          }

          const age = Date.now() - entry.timestamp
          const ttl = maxAge || entry.ttl

          if (age > ttl) {
            // Delete expired entry
            const deleteTransaction = db.transaction(['cache'], 'readwrite')
            const deleteStore = deleteTransaction.objectStore('cache')
            deleteStore.delete(key)
            resolve(null)
          } else {
            resolve(entry.data)
          }
        }
        
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.warn('IndexedDB cache retrieval failed:', error)
      return null
    }
  }

  private async setIndexedDB(key: string, data: any, ttl: number): Promise<void> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      
      const entry: CacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      }

      return new Promise((resolve, reject) => {
        const request = store.put(entry)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.warn('IndexedDB cache failed:', error)
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PerformanceSystemCache', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }
    })
  }

  private async clearIndexedDBPattern(pattern: string): Promise<void> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const regex = new RegExp(pattern)

      return new Promise((resolve, reject) => {
        const request = store.openCursor()
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            if (regex.test(cursor.key)) {
              cursor.delete()
            }
            cursor.continue()
          } else {
            resolve()
          }
        }
        
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.warn('IndexedDB pattern clear failed:', error)
    }
  }

  private evictOldestEntry(): void {
    if (this.cachePolicy.strategy === 'lru') {
      let oldestKey = ''
      let oldestTime = Date.now()

      for (const [key, entry] of this.memoryCache) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp
          oldestKey = key
        }
      }

      if (oldestKey) {
        this.memoryCache.delete(oldestKey)
      }
    } else if (this.cachePolicy.strategy === 'fifo') {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey)
      }
    }
  }

  private calculateTotalSize(): number {
    let size = 0
    for (const entry of this.memoryCache.values()) {
      size += JSON.stringify(entry).length
    }
    return size
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.memoryCache) {
        if (now - entry.timestamp > entry.ttl) {
          this.memoryCache.delete(key)
        }
      }
    }, 60000) // Clean up every minute
  }
}

export const cacheRepository = new CacheRepository()