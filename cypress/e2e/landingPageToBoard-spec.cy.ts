/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import { columnTemplates } from "../../src/routes/NewBoard/columnTemplates"
import translationEn from "../../src/i18n/en/translation.json"

describe("Navigation from landing page to board", () => {
    it("should successfully navigate from the homepage to the board", () => {
        // go to homepage
        cy.visit("/")

        // switch to english
        cy.changeLanguageToEnglish()
        cy.acceptCookies()

        // click CTA
        cy.get("a").contains(translationEn.Homepage.startButton).click()

        // navigates to /login
        cy.url().should("include", "/login")
        cy.get("h1").contains(translationEn.LoginBoard.title)

        // terms and conditions checkbox
        cy.get("[type='checkbox']").should("not.be.checked")
        cy.get("[type='checkbox']").check()

        // click CTA
        cy.get("button").contains(translationEn.LoginBoard.login).click()

        // check templates
        cy.get("h1").contains(translationEn.NewBoard.basicConfigurationTitle)
        Object.values(columnTemplates).forEach(templateName => {
            cy.contains(templateName.name)
        })

        cy.get("button")
        .contains(translationEn.NewBoard.createNewBoard)
        .parent()
        .should("be.disabled")

        // select template
        cy.get("input[type='radio']").siblings().contains("Lean Coffee").click()

        cy.get("button")
        .contains(translationEn.NewBoard.createNewBoard)
        .parent()
        .should("not.be.disabled")

        // click CTA
        cy.get("button")
        .contains(translationEn.NewBoard.createNewBoard)
        .click()

        // navigates to the board
        cy.url().should("include", "/board/")
        cy.get("h2").contains("Lean Coffee")
    })
  })