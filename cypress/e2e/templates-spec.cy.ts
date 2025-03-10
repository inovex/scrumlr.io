/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("templates", () => {
  before(cy.login)

  it("should create board from recommended template", () => {
    cy
      .get<HTMLDivElement>("[data-cy='template-card__RECOMMENDED']")
      .first()
      .find<HTMLButtonElement>("[data-cy='template-card__start-button']")
      .first()
      .focus()
      .click()

    cy
      .url()
      .should("include", "/board")
  })
})
