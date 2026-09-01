describe("Board", () => {
  beforeEach(()=>{
    cy.login()
    cy.visit("/boards/")
  })

  it("should create board from recommended template", () => {
    cy.createBoard()

    cy
      .url()
      .should("not.include", "/boards/templates") // not on templates anymore
      .should("include", "/board")
  })
})
