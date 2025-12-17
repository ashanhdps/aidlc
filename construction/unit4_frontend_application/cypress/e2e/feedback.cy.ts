/**
 * Feedback Interface E2E Tests
 * Tests for US-020 (Receive Performance Feedback)
 */

describe('Feedback Interface (US-020)', () => {
  beforeEach(() => {
    cy.loginAs('employee')
    cy.visit('/feedback')
  })

  describe('Feedback Display', () => {
    it('should display feedback history chronologically', () => {
      cy.get('[data-testid="feedback-list"]', { timeout: 10000 }).should('be.visible')
    })

    it('should show feedback notifications prominently', () => {
      cy.get('[data-testid="notification-panel"]').should('exist')
    })

    it('should display feedback linked to specific KPIs', () => {
      cy.get('[data-testid="kpi-linked-feedback"]').should('exist')
    })

    it('should indicate feedback sentiment visually', () => {
      cy.get('[data-testid="sentiment-indicator"]').should('exist')
    })
  })

  describe('Feedback Interaction', () => {
    it('should allow filtering feedback history', () => {
      cy.get('[data-testid="feedback-filter"]').should('exist')
      cy.get('[data-testid="feedback-filter"]').click()
      cy.contains('All Feedback').click()
    })

    it('should allow searching feedback', () => {
      cy.get('[data-testid="feedback-search"]').should('exist')
      cy.get('[data-testid="feedback-search"]').type('performance')
    })

    it('should support threaded conversation responses', () => {
      cy.get('[data-testid="feedback-thread"]').first().click()
      cy.get('[data-testid="reply-input"]').should('be.visible')
      cy.get('[data-testid="reply-input"]').type('Thank you for the feedback')
      cy.get('[data-testid="send-reply"]').click()
    })
  })

  describe('Feedback Accessibility', () => {
    it('should have accessible feedback list', () => {
      cy.get('[data-testid="feedback-list"]', { timeout: 10000 }).should('be.visible')
      cy.checkA11y()
    })

    it('should support keyboard navigation through feedback items', () => {
      cy.get('[data-testid="feedback-item"]').first().focus()
      cy.focused().type('{enter}')
    })
  })

  describe('Visual Regression', () => {
    it('should take visual snapshot of feedback page', () => {
      cy.get('[data-testid="feedback-list"]', { timeout: 10000 }).should('be.visible')
      cy.percySnapshot('Feedback Interface - Employee')
    })
  })
})
