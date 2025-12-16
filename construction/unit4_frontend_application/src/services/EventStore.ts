import { WebSocketEvent } from '../types/api'

interface DomainEvent {
  id: string
  type: string
  aggregateId: string
  aggregateType: string
  payload: any
  timestamp: string
  version: number
  userId?: string
}

interface EventHandler {
  eventType: string
  handler: (event: DomainEvent) => void | Promise<void>
}

class EventStore {
  private events: Map<string, DomainEvent[]> = new Map()
  private handlers: Map<string, EventHandler[]> = new Map()
  private eventCounter = 0

  // Store a domain event
  async append(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    payload: any,
    userId?: string
  ): Promise<DomainEvent> {
    const event: DomainEvent = {
      id: `event-${++this.eventCounter}`,
      type: eventType,
      aggregateId,
      aggregateType,
      payload,
      timestamp: new Date().toISOString(),
      version: this.getNextVersion(aggregateId),
      userId,
    }

    // Store the event
    const aggregateEvents = this.events.get(aggregateId) || []
    aggregateEvents.push(event)
    this.events.set(aggregateId, aggregateEvents)

    // Publish to handlers
    await this.publish(event)

    return event
  }

  // Get all events for an aggregate
  getEvents(aggregateId: string): DomainEvent[] {
    return this.events.get(aggregateId) || []
  }

  // Get events by type
  getEventsByType(eventType: string): DomainEvent[] {
    const allEvents: DomainEvent[] = []
    for (const events of this.events.values()) {
      allEvents.push(...events.filter(e => e.type === eventType))
    }
    return allEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  // Get events in time range
  getEventsInRange(startTime: string, endTime: string): DomainEvent[] {
    const allEvents: DomainEvent[] = []
    for (const events of this.events.values()) {
      allEvents.push(...events.filter(e => 
        e.timestamp >= startTime && e.timestamp <= endTime
      ))
    }
    return allEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  // Subscribe to events
  subscribe(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    const eventHandlers = this.handlers.get(eventType) || []
    eventHandlers.push({ eventType, handler })
    this.handlers.set(eventType, eventHandlers)
  }

  // Unsubscribe from events
  unsubscribe(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    const eventHandlers = this.handlers.get(eventType) || []
    const filtered = eventHandlers.filter(h => h.handler !== handler)
    this.handlers.set(eventType, filtered)
  }

  // Publish event to all subscribers
  private async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || []
    
    // Execute all handlers
    const promises = handlers.map(({ handler }) => {
      try {
        return Promise.resolve(handler(event))
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error)
        return Promise.resolve()
      }
    })

    await Promise.allSettled(promises)
  }

  // Get next version number for aggregate
  private getNextVersion(aggregateId: string): number {
    const events = this.events.get(aggregateId) || []
    return events.length + 1
  }

  // Replay events for an aggregate
  async replay(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    const events = this.getEvents(aggregateId)
    const filteredEvents = fromVersion 
      ? events.filter(e => e.version >= fromVersion)
      : events

    // Re-publish events in order
    for (const event of filteredEvents) {
      await this.publish(event)
    }

    return filteredEvents
  }

  // Create snapshot of current state
  createSnapshot(): {
    eventCount: number
    aggregateCount: number
    eventTypes: string[]
    lastEventTime: string | null
  } {
    let totalEvents = 0
    let lastEventTime: string | null = null
    const eventTypes = new Set<string>()

    for (const events of this.events.values()) {
      totalEvents += events.length
      for (const event of events) {
        eventTypes.add(event.type)
        if (!lastEventTime || event.timestamp > lastEventTime) {
          lastEventTime = event.timestamp
        }
      }
    }

    return {
      eventCount: totalEvents,
      aggregateCount: this.events.size,
      eventTypes: Array.from(eventTypes),
      lastEventTime,
    }
  }

  // Clear all events (for testing)
  clear(): void {
    this.events.clear()
    this.handlers.clear()
    this.eventCounter = 0
  }

  // Export events for backup/analysis
  exportEvents(): DomainEvent[] {
    const allEvents: DomainEvent[] = []
    for (const events of this.events.values()) {
      allEvents.push(...events)
    }
    return allEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  // Import events from backup
  async importEvents(events: DomainEvent[]): Promise<void> {
    // Sort events by timestamp
    const sortedEvents = events.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    
    // Clear existing events
    this.clear()

    // Import events
    for (const event of sortedEvents) {
      const aggregateEvents = this.events.get(event.aggregateId) || []
      aggregateEvents.push(event)
      this.events.set(event.aggregateId, aggregateEvents)
      
      // Update counter
      const eventNum = parseInt(event.id.replace('event-', ''))
      if (eventNum > this.eventCounter) {
        this.eventCounter = eventNum
      }
    }
  }
}

// Domain-specific event types
export const DashboardEvents = {
  LOADED: 'dashboard:loaded',
  WIDGET_UPDATED: 'dashboard:widget-updated',
  FILTER_APPLIED: 'dashboard:filter-applied',
  LAYOUT_CHANGED: 'dashboard:layout-changed',
  CUSTOMIZED: 'dashboard:customized',
} as const

export const VisualizationEvents = {
  RENDERED: 'visualization:rendered',
  DATA_POINT_SELECTED: 'visualization:data-point-selected',
  CHART_ZOOMED: 'visualization:chart-zoomed',
  EXPORT_REQUESTED: 'visualization:export-requested',
  CONFIGURED: 'visualization:configured',
} as const

export const AssessmentEvents = {
  FORM_LOADED: 'assessment:form-loaded',
  DRAFT_SAVED: 'assessment:draft-saved',
  FIELD_VALIDATED: 'assessment:field-validated',
  FORM_SUBMITTED: 'assessment:form-submitted',
  VALIDATION_FAILED: 'assessment:validation-failed',
} as const

export const FeedbackEvents = {
  RECEIVED: 'feedback:received',
  RESPONDED: 'feedback:responded',
  THREAD_RESOLVED: 'feedback:thread-resolved',
  NOTIFICATION_DISPLAYED: 'feedback:notification-displayed',
  SEARCHED: 'feedback:searched',
} as const

export const SessionEvents = {
  ESTABLISHED: 'session:established',
  PREFERENCES_UPDATED: 'session:preferences-updated',
  EXPIRED: 'session:expired',
  NAVIGATION_CHANGED: 'session:navigation-changed',
  CACHE_INVALIDATED: 'session:cache-invalidated',
} as const

export const eventStore = new EventStore()