/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("templates", () => {
  beforeEach(cy.login)

  it.skip("should create board from recommended template", () => {
    cy
      // select template
      .get<HTMLDivElement>("[data-cy='template-card--RECOMMENDED']")
      .first()
      .find<HTMLButtonElement>("[data-cy='template-card__start-button']")
      .first()
      .click()
      // select access setting (default public) and click button to start session
      .get("[data-cy='access-settings__start-button']")
      .click()

    cy
      .url()
      .should("not.include", "/boards/templates") // not on templates anymore
      .should("include", "/board")
  })

  it.skip("should create a new template with default settings", () => {
    cy
      .createCustomTemplate("Custom Template")

    cy
      .url()
      .should("include", "/boards/templates") // we're so back

    cy.get("[data-cy='template-card--CUSTOM']")
      .should("have.length", 1)
  });

  it.skip("should delete custom template", () => {
    cy
      .createCustomTemplate("Del Template")

    cy
      .get("[data-cy='template-card__menu--closed']")
      .click()

    cy
      .get("[data-cy='template-card__menu-item-Delete']")
      .click()

    cy.get("[data-cy='template-card--CUSTOM']")
      .should("not.exist")
  });

  it.skip("should edit custom template", () => {
    cy
      .createCustomTemplate("Edit Template")

    cy
      .get("[data-cy='template-card__menu--closed']")
      .click()

    cy
      .get("[data-cy='template-card__menu-item-Edit']")
      .click()
  });
})
