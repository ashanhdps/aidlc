import React, { useCallback, useMemo, useRef, useEffect } from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark the start of a performance measurement
  mark(name: string): void {
    performance.mark(`${name}-start`)
  }

  // Mark the end and measure the duration
  measure(name: string): number {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    const duration = measure.duration

    // Store the measurement
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)

    return duration
  }

  // Get average duration for a metric
  getAverage(name: string): number {
    const measurements = this.metrics.get(name)
    if (!measurements || measurements.length === 0) return 0
    
    return measurements.reduce((sum, val) => sum + val, 0) / measurements.length
  }

  // Get all metrics
  getAllMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {}
    
    this.metrics.forEach((measurements, name) => {
      result[name] = {
        average: this.getAverage(name),
        count: measurements.length,
        latest: measurements[measurements.length - 1] || 0
      }
    })

    return result
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear()
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// React hooks for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Memoization utilities
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps)
}

// Virtual scrolling hook
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(visibleStart, visibleEnd)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleStart * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop)
    }
  }
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '')
  const [isLoaded, setIsLoaded] = React.useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image()
          img.onload = () => {
            setImageSrc(src)
            setIsLoaded(true)
          }
          img.src = src
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  return { imageSrc, isLoaded, imgRef }
}

// Bundle size optimization utilities
export const loadComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc)
}

// Memory leak prevention
export function useCleanup(cleanup: () => void) {
  useEffect(() => {
    return cleanup
  }, [cleanup])
}

// Performance measurement hook
export function usePerformanceMeasurement(name: string) {
  const monitor = PerformanceMonitor.getInstance()

  useEffect(() => {
    monitor.mark(name)
    return () => {
      monitor.measure(name)
    }
  }, [name, monitor])
}

// Render optimization utilities
export const shouldComponentUpdate = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keys?: (keyof T)[]
): boolean => {
  const keysToCheck = keys || Object.keys(nextProps) as (keyof T)[]
  
  return keysToCheck.some(key => prevProps[key] !== nextProps[key])
}

// Web Worker utilities for heavy computations
export class WebWorkerManager {
  private workers: Map<string, Worker> = new Map()

  createWorker(name: string, script: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!
    }

    const blob = new Blob([script], { type: 'application/javascript' })
    const worker = new Worker(URL.createObjectURL(blob))
    
    this.workers.set(name, worker)
    return worker
  }

  terminateWorker(name: string): void {
    const worker = this.workers.get(name)
    if (worker) {
      worker.terminate()
      this.workers.delete(name)
    }
  }

  terminateAll(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers.clear()
  }
}

// Resource preloading
export const preloadResource = (href: string, as: string): void => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Critical CSS inlining
export const inlineCriticalCSS = (css: string): void => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

export const performanceMonitor = PerformanceMonitor.getInstance()
export const webWorkerManager = new WebWorkerManager()