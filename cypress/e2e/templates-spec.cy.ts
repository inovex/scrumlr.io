/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

const uniqueTemplateName = (prefix: string) => `${prefix} ${Date.now()}-${Cypress._.random(1000,9999)}`


const getTemplateByName = (templateName: string): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy
    .get("[data-cy='template-card--CUSTOM']")
    .filter(`:has(input[value="${templateName}"])`);


describe("templates", () => {
  beforeEach (() => {
    cy.login()
    cy.visit("/boards/templates")
  })

  it("should create board from recommended template", () => {
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

    cy
      .url()
      .should("not.include", "/boards/templates") // not on templates anymore
      .should("include", "/board")
  })

  it("should create a new template with default settings", () => {
    const templateName = uniqueTemplateName("Custom Template")
    cy
      .createCustomTemplate(templateName)
    cy
      .url()
      .should("include", "/boards/templates") // we're so back

    getTemplateByName(templateName).should("exist");
  });

  it("should delete custom template", () => {
    const templateName = uniqueTemplateName("Delete Template")
    cy
      .createCustomTemplate(templateName)

    getTemplateByName(templateName)
      .within(() => {
        cy.selectMiniMenu("template-card__menu", "Delete")
      });
    cy.get('.template-card')
      .filter(`:has(input[value="${templateName}"])`)
      .should("not.exist")
  });

  it("should edit custom template", () => {
        const templateName = uniqueTemplateName("Edit Template")
    cy
      .createCustomTemplate(templateName)

    getTemplateByName(templateName)
      .within(() => {
        cy.selectMiniMenu("template-card__menu", "Edit")
      });

    cy
      .get("[data-cy='columns-configurator-column__color-picker']")
      .first()
      .click()

    cy
      .get("[data-cy='columns-configurator-column__color-picker--goal-green']")
      .click()

    cy
      .get("[data-cy='columns-configurator-column__icon--visibility']")
      .click({multiple:true})

    cy
      .get("[data-cy='columns-configurator-column__drag-element']")
      .first()
      .trigger("mousedown", {force: true, button: 0})
      .trigger("mousemove", {clientX:1000, clientY:300, force: true})
      .trigger("mouseup", {force:true})

    cy
      .get<HTMLButtonElement>("[data-cy='template-editor__button--create']")
      .click()

  });
})
