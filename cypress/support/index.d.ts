/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to accept the cookies so the cookie banner is dismissed.
       */
      acceptCookies(): Chainable<void>

            /**
       * Custom command to change the language to english.
       */
      changeLanguageToEnglish(): Chainable<void>
    }
  }