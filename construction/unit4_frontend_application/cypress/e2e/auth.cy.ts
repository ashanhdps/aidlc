/**
 * Authentication & Session E2E Tests
 * Tests for US-007, US-010, US-012 - Login functionality for all personas
 */

describe('Authentication & Session Management', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('Login Functionality', () => {
    it('should display login page with demo credentials', () => {
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.contains('Demo Credentials').should('be.visible')
    })

    it('should login successfully as Employee', () => {
      cy.login('employee@example.com', 'password')
      cy.url().should('include', '/dashboard')
      cy.contains('John Doe').should('be.visible')
    })

    it('should login successfully as Supervisor', () => {
      cy.login('supervisor@example.com', 'password')
      cy.url().should('include', '/dashboard')
      cy.contains('Emily Martinez').should('be.visible')
    })

    it('should login successfully as HR', () => {
      cy.login('hr@example.com', 'password')
      cy.url().should('include', '/dashboard')
      cy.contains('Sarah Johnson').should('be.visible')
    })

    it('should login successfully as Executive', () => {
      cy.login('executive@example.com', 'password')
      cy.url().should('include', '/dashboard')
      cy.contains('Robert Chen').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.get('input[type="email"]').type('invalid@example.com')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      cy.contains('Invalid email or password').should('be.visible')
      cy.url().should('include', '/login')
    })

    it('should persist session to localStorage', () => {
      cy.login('employee@example.com', 'password')
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null
        expect(win.localStorage.getItem('user_profile')).to.not.be.null
      })
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should allow authenticated users to access dashboard', () => {
      cy.loginAs('employee')
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
    })

    it('should redirect to unauthorized for restricted routes', () => {
      cy.loginAs('employee')
      // Employee should not access executive dashboard
      cy.visit('/executive')
      cy.url().should('include', '/unauthorized')
    })
  })

  describe('Session Management', () => {
    it('should restore session from localStorage on page reload', () => {
      cy.loginAs('employee')
      cy.reload()
      cy.url().should('include', '/dashboard')
    })

    it('should clear session on logout', () => {
      cy.loginAs('employee')
      cy.logout()
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null
      })
    })
  })

  describe('Visual Regression', () => {
    it('should match login page snapshot', () => {
      cy.percySnapshot('Login Page')
    })

    it('should match login error state snapshot', () => {
      cy.get('input[type="email"]').type('invalid@example.com')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      cy.contains('Invalid email or password').should('be.visible')
      cy.percySnapshot('Login Page - Error State')
    })
  })
})
