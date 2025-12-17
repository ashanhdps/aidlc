/**
 * Dashboard E2E Tests
 * Tests for US-007 (Personal KPI Dashboard), US-010 (Team Performance), US-012 (Executive Overview)
 */

describe('Dashboard Functionality', () => {
  describe('Personal KPI Dashboard (US-007)', () => {
    beforeEach(() => {
      cy.loginAs('employee')
    })

    it('should load dashboard within 3 seconds', () => {
      const startTime = Date.now()
      cy.waitForDashboard()
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('should display KPI widgets with progress indicators', () => {
      cy.waitForDashboard()
      cy.get('[data-testid="kpi-widget"]').should('have.length.at.least', 1)
    })

    it('should display traffic-light status indicators', () => {
      cy.waitForDashboard()
      cy.get('[data-testid="status-indicator"]').should('exist')
    })

    it('should filter dashboard by time period', () => {
      cy.waitForDashboard()
      cy.get('[data-testid="time-filter"]').should('exist')
      cy.get('[data-testid="time-filter"]').click()
      cy.contains('Monthly').click()
    })

    it('should allow dashboard layout customization', () => {
      cy.waitForDashboard()
      cy.get('[data-testid="customize-dashboard"]').should('exist')
    })

    it('should take visual snapshot of personal dashboard', () => {
      cy.waitForDashboard()
      cy.percySnapshot('Personal KPI Dashboard - Employee')
    })
  })

  describe('Team Performance Dashboard (US-010)', () => {
    beforeEach(() => {
      cy.loginAs('supervisor')
    })

    it('should display team performance metrics', () => {
      cy.visit('/team')
      cy.get('[data-testid="team-dashboard"]', { timeout: 10000 }).should('be.visible')
    })

    it('should show individual employee KPI status', () => {
      cy.visit('/team')
      cy.get('[data-testid="employee-kpi-card"]').should('have.length.at.least', 1)
    })

    it('should allow sorting and filtering team members', () => {
      cy.visit('/team')
      cy.get('[data-testid="team-filter"]').should('exist')
    })

    it('should highlight employees needing attention', () => {
      cy.visit('/team')
      cy.get('[data-testid="attention-indicator"]').should('exist')
    })

    it('should take visual snapshot of team dashboard', () => {
      cy.visit('/team')
      cy.get('[data-testid="team-dashboard"]', { timeout: 10000 }).should('be.visible')
      cy.percySnapshot('Team Performance Dashboard - Supervisor')
    })
  })

  describe('Executive Dashboard (US-012)', () => {
    beforeEach(() => {
      cy.loginAs('executive')
    })

    it('should display company-wide KPI achievement rates', () => {
      cy.visit('/executive')
      cy.get('[data-testid="executive-dashboard"]', { timeout: 10000 }).should('be.visible')
    })

    it('should show department-level performance comparisons', () => {
      cy.visit('/executive')
      cy.get('[data-testid="department-comparison"]').should('exist')
    })

    it('should support drill-down from company to individual level', () => {
      cy.visit('/executive')
      cy.get('[data-testid="drill-down-chart"]').should('exist')
    })

    it('should take visual snapshot of executive dashboard', () => {
      cy.visit('/executive')
      cy.get('[data-testid="executive-dashboard"]', { timeout: 10000 }).should('be.visible')
      cy.percySnapshot('Executive Dashboard')
    })
  })

  describe('Dashboard Accessibility', () => {
    beforeEach(() => {
      cy.loginAs('employee')
      cy.waitForDashboard()
    })

    it('should have accessible KPI widgets', () => {
      cy.checkA11y()
    })

    it('should support keyboard navigation', () => {
      cy.get('body').tab()
      cy.focused().should('exist')
    })
  })
})
