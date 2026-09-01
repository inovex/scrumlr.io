/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import translationEn from "../../src/i18n/en/translation.json"

Cypress.Commands.add("acceptCookies", () => {
    cy.get("[data-cy='cookie-notice__accept']").click()
});

Cypress.Commands.add("changeLanguageToEnglish", () => {
    cy.get(`button[aria-label=${translationEn.Language.english}]`).click({ force: true })
});

Cypress.Commands.add("login", () => {
  const AGENT_NAME = "Cypress Agent"
  cy.session(AGENT_NAME, () => {
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
      .get("[data-cy='login-board__anonymous-toggle']")
      .focus()
      .click()

    cy
      .get<HTMLInputElement>("input[data-cy='login-board__username']")
      .focus()
      .clear()
      .type(AGENT_NAME)
      .should("have.value", AGENT_NAME)

    cy
      .get<HTMLButtonElement>("button[data-cy='login-board__anonymous-login-button']")
      .first()
      .focus()
      .click()

    cy
      .url()
      .should("include", "/boards/templates")
  },
  {
    validate() {
      cy
        .request("/api/users")
        .its("status")
        .should("eq", 200)
    },
  })
})

// from templates view, creates a new template with given name and default columns.
Cypress.Commands.add("createCustomTemplate", (templateName: string)=>{
  cy
    .get("[data-cy='create-template-card']")
    .click()

  cy
    .url()
    .should("include", "/boards/create")

  cy.get<HTMLButtonElement>("[data-cy='editor-shell__button--create']")
    .should("be.disabled")
  cy
    .get("[data-cy='editor-shell__name-input']")
    .type(templateName)

  cy
    .get<HTMLButtonElement>("[data-cy='editor-shell__button--create']")
    .should("not.be.disabled")
    .click()
})

Cypress.Commands.add("createBoard", ()=>{
  cy
    // select template
    .get<HTMLDivElement>("[data-cy='template-card--RECOMMENDED']")
    .first()
    .find<HTMLButtonElement>("[data-cy='template-card__start-button']")
    .first()
    .click()
    // select access setting (default public) and click button to start session
    .get("[data-testid='simple-modal__primary-button']")
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

// create a note and return the subject
Cypress.Commands.add("createNote", (text: string)=>{
  cy
    .get<HTMLInputElement>(".note-input__input")
    .first()
    .type(text)
    .press("Enter")

  // note: since notes pop up on top, we assume the first note we grab is the one we just created
  // this strategy will probably fall short if a columnId parameter is added
  return cy.get<HTMLDivElement>(".note").first()
})
