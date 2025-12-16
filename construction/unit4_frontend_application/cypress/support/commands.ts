// Cypress Custom Commands

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with specified credentials
       * @example cy.login('employee@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to login as a specific persona
       * @example cy.loginAs('employee')
       */
      loginAs(persona: 'employee' | 'supervisor' | 'hr' | 'executive'): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to wait for dashboard to load
       * @example cy.waitForDashboard()
       */
      waitForDashboard(): Chainable<void>
      
      /**
       * Custom command to check accessibility
       * @example cy.checkA11y()
       */
      checkA11y(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Login as persona command
Cypress.Commands.add('loginAs', (persona: 'employee' | 'supervisor' | 'hr' | 'executive') => {
  const credentials: Record<string, { email: string; password: string }> = {
    employee: { email: 'employee@example.com', password: 'password' },
    supervisor: { email: 'supervisor@example.com', password: 'password' },
    hr: { email: 'hr@example.com', password: 'password' },
    executive: { email: 'executive@example.com', password: 'password' },
  }
  
  const { email, password } = credentials[persona]
  cy.login(email, password)
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage()
  cy.visit('/login')
})

// Wait for dashboard command
Cypress.Commands.add('waitForDashboard', () => {
  cy.get('[data-testid="dashboard-container"]', { timeout: 10000 }).should('be.visible')
})

// Accessibility check command (basic implementation)
Cypress.Commands.add('checkA11y', () => {
  // Check for basic accessibility issues
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt')
  })
  
  cy.get('button').each(($btn) => {
    cy.wrap($btn).should('satisfy', ($el) => {
      return $el.text().trim().length > 0 || $el.attr('aria-label')
    })
  })
})

export {}
