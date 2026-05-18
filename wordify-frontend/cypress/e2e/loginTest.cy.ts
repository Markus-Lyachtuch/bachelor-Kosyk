describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000");
    cy.get('[data-testid="cypress-main-left-title"]').should("have.text", "Discover NEW Method");
    cy.get('[data-testid="cypress-main-left-btn"]').should("have.text", "Start learning").click();

    cy.get('[data-testid="cypress-login-email-input"]').should("be.visible").type("kosyk.natalie@gmail.com");
    cy.get('[data-testid="cypress-login-password-input"]').should("be.visible").type("123456789aU%");
    cy.get('[data-testid="cypress-login-submit-btn"]').click();
  });
});
