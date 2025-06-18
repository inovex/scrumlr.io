/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      login(): Chainable<void>

      /**
       * Custom command to accept the cookies so the cookie banner is dismissed.
       */
      acceptCookies(): Chainable<void>

            /**
       * Custom command to change the language to english.
       */
      changeLanguageToEnglish(): Chainable<void>

      // create template with given name
      createCustomTemplate(templateName: string): Chainable<void>

      // opens mini menu and clicks an item from it
      // make sure to append --closed to the mini menu icon so cyData matches
      selectMiniMenu(cyData: string, itemLabel: string): Chainable<void>
    }

  }
