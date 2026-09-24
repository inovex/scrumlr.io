describe("Columns", () => {
  beforeEach(()=>{
    cy.login()
    cy.visit("/boards/")
    cy.createBoard()
  })

  it('should create a column next to the first column', () => {
    cy.get(".column")
      .should("have.length", 2)
      .first()
      .within(() => {
        cy.selectMiniMenu("column-settings-mini-menu", "Add-column-left")
      });
    // at this point there's a temporary column

    cy.get<HTMLInputElement>(".column-details__name--editing")
      .type("New Column")
    cy.get(".column-details__description-text-area")
      .type("New Column Description")
      .press("Enter")

    cy.get(".column").should("have.length", 3);
  });

  it('should delete a column', () => {
    cy.get(".column")
      .should("have.length", 2)
      .first()
      .within(() => {
        cy.selectMiniMenu("column-settings-mini-menu", "Delete-column")
      });

    cy.get(".column").should("have.length", 1);
  });

  it("should change the color of a column", () => {
    cy.get(".column")
      .should("have.length", 2)
      .first()
      .should("have.class", "accent-color__backlog-blue")
      .within(() => {
        cy.selectMiniMenu("column-settings-mini-menu", "Change-color")
      });

    cy.get(".color-picker__item-button[data-cy='column-color-picker--goal-green']").click()

    cy.get(".column")
      .first()
      .should("have.class", "accent-color__goal-green")
  });
})
