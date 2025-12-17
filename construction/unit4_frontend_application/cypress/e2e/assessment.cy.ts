/**
 * Assessment Interface E2E Tests
 * Tests for US-016 (Self-Assessment) and US-017 (Manager Performance Scoring)
 */

describe('Assessment Interface', () => {
  describe('Self-Assessment Form (US-016)', () => {
    beforeEach(() => {
      cy.loginAs('employee')
      cy.visit('/assessments')
    })

    it('should display self-assessment form with progress indicator', () => {
      cy.get('[data-testid="assessment-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('[data-testid="progress-indicator"]').should('exist')
    })

    it('should validate required fields', () => {
      cy.get('[data-testid="submit-assessment"]').click()
      cy.get('[data-testid="validation-error"]').should('be.visible')
    })

    it('should save draft automatically', () => {
      cy.get('[data-testid="assessment-field"]').first().type('Test response')
      // Wait for auto-save (30 seconds in real app, mocked here)
      cy.get('[data-testid="draft-saved-indicator"]', { timeout: 5000 }).should('be.visible')
    })

    it('should allow document upload', () => {
      cy.get('[data-testid="document-upload"]').should('exist')
    })

    it('should show KPI performance data alongside assessment', () => {
      cy.get('[data-testid="kpi-context"]').should('be.visible')
    })

    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="assessment-form"]').should('be.visible')
    })

    it('should take visual snapshot of assessment form', () => {
      cy.percySnapshot('Self-Assessment Form - Employee')
    })
  })

  describe('Manager Assessment Interface (US-017)', () => {
    beforeEach(() => {
      cy.loginAs('supervisor')
      cy.visit('/assessments')
    })

    it('should display employee self-assessment alongside manager scoring', () => {
      cy.get('[data-testid="manager-assessment"]', { timeout: 10000 }).should('be.visible')
      cy.get('[data-testid="employee-self-assessment"]').should('exist')
      cy.get('[data-testid="manager-scoring"]').should('exist')
    })

    it('should highlight score discrepancies', () => {
      cy.get('[data-testid="score-discrepancy"]').should('exist')
    })

    it('should show contextual KPI performance data', () => {
      cy.get('[data-testid="kpi-performance-context"]').should('be.visible')
    })

    it('should support rich text comments', () => {
      cy.get('[data-testid="comment-field"]').should('exist')
    })

    it('should support side-by-side employee comparison', () => {
      cy.get('[data-testid="compare-employees"]').should('exist')
    })

    it('should take visual snapshot of manager assessment', () => {
      cy.percySnapshot('Manager Assessment Interface - Supervisor')
    })
  })

  describe('Assessment Accessibility', () => {
    beforeEach(() => {
      cy.loginAs('employee')
      cy.visit('/assessments')
    })

    it('should have accessible form fields', () => {
      cy.get('[data-testid="assessment-form"]', { timeout: 10000 }).should('be.visible')
      cy.checkA11y()
    })

    it('should announce validation errors to screen readers', () => {
      cy.get('[data-testid="submit-assessment"]').click()
      cy.get('[role="alert"]').should('exist')
    })
  })
})
