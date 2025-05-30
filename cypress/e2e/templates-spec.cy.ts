/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("templates", () => {
  before(cy.login)

  it("should create board from recommended template", () => {
    cy
      // select template
      .get<HTMLDivElement>("[data-cy='template-card__RECOMMENDED']")
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
})
