/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import translationEn from "../../src/i18n/en/translation.json"

Cypress.Commands.add("acceptCookies", () => {
    cy.contains(translationEn.CookieNotice.accept).click()
});

Cypress.Commands.add("changeLanguageToEnglish", () => {
    cy.get(`button[aria-label=${translationEn.Language.english}]`).click({ force: true })
});

Cypress.Commands.add("login", () => {
  const AGENT_NAME = "Cypress Agent"
  cy.visit("/")
  cy.acceptCookies()

  cy
    .get<HTMLAnchorElement>("a.homepage__start-button")
    .focus()
    .click()

  cy
    .url()
    .should("include", "/login")

  cy
    .get<HTMLInputElement>("input[data-cy='login-board__username']")
    .focus()
    .clear()
    .type(AGENT_NAME)
    .should("have.value", AGENT_NAME)

  cy
    .get<HTMLInputElement>("input[data-cy='login-board__checkbox']")
    .focus()
    .check()
    .should("be.checked", true)

  cy
    .get<HTMLButtonElement>("button[data-cy='login-board__anonymous-login-button']")
    .first()
    .focus()
    .click()

  cy
    .url()
    .should("include", "/boards/templates")
})
