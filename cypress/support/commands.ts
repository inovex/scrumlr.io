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

// from templates view, creates a new template with given name and default columns.
Cypress.Commands.add("createCustomTemplate", (templateName: string)=>{
  cy
    .get("[data-cy='create-template-card']")
    .click()

  cy
    .url()
    .should("include", "/boards/create")

  cy.get<HTMLButtonElement>("[data-cy='template-editor__button--create']")
    .should("be.disabled")
  cy
    .get("[data-cy='template-editor__name-input']")
    .type(templateName)

  cy
    .get<HTMLButtonElement>("[data-cy='template-editor__button--create']")
    .should("not.be.disabled")
    .click()
})

Cypress.Commands.add("selectMiniMenu", (cyData: string, itemLabel: string)=>{
  cy
    .get(`[data-cy='${cyData}']`)
    .click()

  cy
    .get(`[data-cy='${cyData}-item-${itemLabel}']`)
    .click()
})
