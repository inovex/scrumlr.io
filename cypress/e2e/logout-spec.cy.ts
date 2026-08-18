/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

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
