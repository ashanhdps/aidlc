// Cypress E2E Support File
import './commands'

// Percy visual regression testing
import '@percy/cypress'

// Hide fetch/XHR requests from command log
const app = window.top
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')
  app.document.head.appendChild(style)
}

// Global before each hook
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage()
})

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err) => {
  // Returning false prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})
