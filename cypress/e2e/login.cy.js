describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.contains('Login').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });

  it('should show validation errors for invalid input', () => {
    cy.get('button[type="submit"]').click();
    // Form validation should show errors
    cy.get('input[name="email"]').should('have.attr', 'aria-invalid');
  });

  it('should toggle password visibility', () => {
    cy.get('input[name="password"]').type('testpassword');
    cy.get('button[aria-label="Show password"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
  });
});
