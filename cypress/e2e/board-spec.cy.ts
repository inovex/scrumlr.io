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

  /*
  TODO: add tests for different board use cases:
    - mark as done
    - raise hand
    - board reaction
    - timer
    - voting
    - presenter mode
    - various settings
      - share
      - profile
      - logout
   */
})
