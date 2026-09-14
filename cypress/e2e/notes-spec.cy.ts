/*
* TODO: add tests for different notes use cases:
*  - (un)stack
*  - locked board state
* */
describe("Notes", () => {
  beforeEach(()=>{
    cy.login()
    cy.visit("/boards/")
    cy.createBoard()
  })

  it("should create a note", () => {
    cy.get(".note")
      .should("not.exist")

    cy.createNote("Test note")
      .should("exist")
      .should("contain", "Test note")
  });

  it("should edit a note", () => {
    cy.createNote("Test note")
      .click()

    cy.get<HTMLTextAreaElement>(".note-dialog__note-content-text")
      .type("{selectAll}")
      .type("Edited note")
      .press("Enter")

    cy.press("Escape")

    cy.get(".note")
      .should("contain", "Edited note")
  });

  it("should delete a note", () => {
    cy.createNote("Test Note")
      .click()

    cy.get(".note-option__button--delete")
      .click()
    cy.get(".confirmation-dialog__button--accept")
      .click()

    cy.get(".note")
      .should("not.exist")
  });

  it("should react to a note", () => {
    cy.createNote("I love e2e testing")
      .get(".note-reaction-list__add-reaction-sticker-container")
      .click()

    cy.get(".note-reaction-chip__root").should("not.exist")

    cy.get(".note-reaction-picker__reaction")
      .first()
      .click()

    cy.get(".note-reaction-chip__root").should("exist")
  });
})
