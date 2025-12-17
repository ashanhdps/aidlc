import { DraftState } from '../../../types/domain'

export class DraftManager {
  private readonly STORAGE_KEY = 'assessment_drafts'
  private readonly AUTO_SAVE_INTERVAL = 30000 // 30 seconds

  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Save draft to localStorage
   */
  async saveDraft(assessmentId: string, responses: Record<string, any>): Promise<void> {
    try {
      const drafts = this.getAllDrafts()
      const draft: DraftState = {
        assessmentId,
        responses,
        lastSaved: new Date().toISOString(),
        autoSaveEnabled: true,
      }

      drafts[assessmentId] = draft
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts))
    } catch (error) {
      console.error('Failed to save draft:', error)
      throw new Error('Failed to save draft')
    }
  }

  /**
   * Load draft from localStorage
   */
  loadDraft(assessmentId: string): DraftState | null {
    try {
      const drafts = this.getAllDrafts()
      return drafts[assessmentId] || null
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  }

  /**
   * Delete draft from localStorage
   */
  deleteDraft(assessmentId: string): void {
    try {
      const drafts = this.getAllDrafts()
      delete drafts[assessmentId]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts))
      
      // Clear auto-save timer if exists
      this.stopAutoSave(assessmentId)
    } catch (error) {
      console.error('Failed to delete draft:', error)
    }
  }

  /**
   * Get all drafts from localStorage
   */
  getAllDrafts(): Record<string, DraftState> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load drafts:', error)
      return {}
    }
  }

  /**
   * Check if draft exists for assessment
   */
  hasDraft(assessmentId: string): boolean {
    const drafts = this.getAllDrafts()
    return assessmentId in drafts
  }

  /**
   * Get draft age in minutes
   */
  getDraftAge(assessmentId: string): number | null {
    const draft = this.loadDraft(assessmentId)
    if (!draft) return null

    const lastSaved = new Date(draft.lastSaved)
    const now = new Date()
    return Math.floor((now.getTime() - lastSaved.getTime()) / (1000 * 60))
  }

  /**
   * Start auto-save for an assessment
   */
  startAutoSave(
    assessmentId: string,
    getResponses: () => Record<string, any>,
    onSave?: (draft: DraftState) => void
  ): void {
    // Clear existing timer
    this.stopAutoSave(assessmentId)

    const timer = setInterval(async () => {
      try {
        const responses = getResponses()
        await this.saveDraft(assessmentId, responses)
        
        if (onSave) {
          const draft = this.loadDraft(assessmentId)
          if (draft) {
            onSave(draft)
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, this.AUTO_SAVE_INTERVAL)

    this.autoSaveTimers.set(assessmentId, timer)
  }

  /**
   * Stop auto-save for an assessment
   */
  stopAutoSave(assessmentId: string): void {
    const timer = this.autoSaveTimers.get(assessmentId)
    if (timer) {
      clearInterval(timer)
      this.autoSaveTimers.delete(assessmentId)
    }
  }

  /**
   * Stop all auto-save timers
   */
  stopAllAutoSave(): void {
    this.autoSaveTimers.forEach((timer) => clearInterval(timer))
    this.autoSaveTimers.clear()
  }

  /**
   * Clean up old drafts (older than specified days)
   */
  cleanupOldDrafts(maxAgeDays: number = 30): void {
    try {
      const drafts = this.getAllDrafts()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

      const cleanedDrafts: Record<string, DraftState> = {}
      
      Object.entries(drafts).forEach(([assessmentId, draft]) => {
        const draftDate = new Date(draft.lastSaved)
        if (draftDate > cutoffDate) {
          cleanedDrafts[assessmentId] = draft
        }
      })

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedDrafts))
    } catch (error) {
      console.error('Failed to cleanup old drafts:', error)
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): {
    totalDrafts: number
    storageSize: number
    oldestDraft: string | null
    newestDraft: string | null
  } {
    const drafts = this.getAllDrafts()
    const draftEntries = Object.entries(drafts)
    
    let oldestDate: Date | null = null
    let newestDate: Date | null = null
    let oldestDraft: string | null = null
    let newestDraft: string | null = null

    draftEntries.forEach(([assessmentId, draft]) => {
      const draftDate = new Date(draft.lastSaved)
      
      if (!oldestDate || draftDate < oldestDate) {
        oldestDate = draftDate
        oldestDraft = assessmentId
      }
      
      if (!newestDate || draftDate > newestDate) {
        newestDate = draftDate
        newestDraft = assessmentId
      }
    })

    const storageData = localStorage.getItem(this.STORAGE_KEY) || ''
    const storageSize = new Blob([storageData]).size

    return {
      totalDrafts: draftEntries.length,
      storageSize,
      oldestDraft,
      newestDraft,
    }
  }

  /**
   * Export drafts for backup
   */
  exportDrafts(): string {
    const drafts = this.getAllDrafts()
    return JSON.stringify(drafts, null, 2)
  }

  /**
   * Import drafts from backup
   */
  importDrafts(draftsJson: string): void {
    try {
      const drafts = JSON.parse(draftsJson)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts))
    } catch (error) {
      console.error('Failed to import drafts:', error)
      throw new Error('Invalid drafts format')
    }
  }
}