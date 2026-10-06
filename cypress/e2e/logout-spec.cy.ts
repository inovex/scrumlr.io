/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

// there's a reason for using this custom login instead of the session command:
// cy.session() is designed solely to establish and cache state (cookies, localStorage, sessionStorage).
// it deliberately does not preserve the page URL or DOM state (redirect to about:blank)
// this test is designed around implicit redirects which is why it's done like this.
// (note: with testIsolation set to true which is the default, so if we set it false we could use cy.session and the like, but I think there are good reasons to keep it).
const loginAnonymously = (name: string) => {
  cy.get("[data-cy='login-board__anonymous-toggle']").click();
  cy.get<HTMLInputElement>("input[data-cy='login-board__username']").clear().type(name);
  cy.get<HTMLButtonElement>("button[data-cy='login-board__anonymous-login-button']").click();
};

describe("logout", () => {
  it("does not redirect a new user to the previous user's board", () => {
    cy.visit("/");
    cy.acceptCookies();
    cy.get<HTMLAnchorElement>("a.homepage__start-button").click();
    loginAnonymously("Logout User A");

    cy.get<HTMLDivElement>("[data-cy='template-card--RECOMMENDED']").first().find<HTMLButtonElement>("[data-cy='template-card__start-button']").click();
    cy.get("[data-testid='simple-modal__primary-button']").click();

    cy.url()
      .should("include", "/board/")
      .then((boardUrl) => {
        cy.visit(`${boardUrl}/settings/profile`);
        cy.get<HTMLButtonElement>("button.navigation__item--logout").click();
        loginAnonymously("Logout User B");

        cy.url().should("include", "/boards/templates").and("not.equal", boardUrl);
      });
  });
});
