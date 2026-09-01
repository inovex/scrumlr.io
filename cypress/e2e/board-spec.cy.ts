describe("Board", () => {
  beforeEach(()=>{
    cy.login()
    cy.visit("/boards/")
    cy.createBoard()
  })

  it("should create board from the initial setup", () => {
    cy
      .url()
      .should("not.include", "/boards/templates") // not on templates anymore
      .should("include", "/board")
  })

  /*
  TODO: add tests for different board use cases:
    - presenter mode
    - various settings
      - share
      - profile
      - logout
   */

  it('should mark me as done', () => {
    cy.get('.tooltip-button[data-cy="mark-as-done"]').first().as("markAsDoneButton")
    cy.get('.board-users__button--me > .user-avatar').first().as("boardUserMe")

    cy.get("@boardUserMe").should("not.have.class", "user-ready")

    cy.get("@markAsDoneButton").click()
    cy.get("@boardUserMe").should("have.class", "user-ready")
  });

  it("should raise hand", () => {
    cy.get('.tooltip-button[data-cy="raise-hand"]').first().as("raiseHandButton")

    cy.get('.user-avatar__raised-hand').should('not.exist');
    cy.get("@raiseHandButton").click()
    cy.get('.user-avatar__raised-hand').should('exist');
  });

  it("should react on board", () => {
    cy.get('.tooltip-button[data-cy="board-reactions"]').first().click()

    cy.get('.board-reaction__root').should("not.exist")

    cy.get('.board-reactions-menu__item').first().click()

    cy.get('.board-reaction__root').should("exist")
  });

  it("should create and stop a timer", () => {
    cy.get('.tooltip-button[data-cy="timer"]').first().click()

    cy.get('.dialog__button[data-testid="timer-dialog__1-minute-button"]').first().click()

    cy.get('.timer').should("exist")

    cy.get('#timer__end-timer').click()

    cy.get('.timer').should("not.exist")
  });

  // so far without actually adding votes to notes though
  it("should create and conclude a voting", () => {
    cy.get('.tooltip-button[data-cy="voting"]').first().as("votingMenuButton")
    cy.get("@votingMenuButton").click()

    cy.get('.voting-dialog__start-button[data-testid="voting-dialog__start-button"]').first().click()

    cy.get('.vote-display').should("exist")

    cy.get("@votingMenuButton").click()
    cy.get('.voting-dialog__start-button[data-testid="voting-dialog__stop-button"]').first().click()

    cy.get('.vote-display').should("not.exist")
  });

})

