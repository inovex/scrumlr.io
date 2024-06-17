/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import translationEn from "../../src/i18n/en/translation.json"

Cypress.Commands.add("acceptCookies", () => {
    cy.contains(translationEn.CookieNotice.accept).click()
});

Cypress.Commands.add("changeLanguageToEnglish", () => {
    cy.get(`button[aria-label=${translationEn.Language.english}]`).click({ force: true })
});