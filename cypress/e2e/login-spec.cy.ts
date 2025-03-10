/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import { legacyColumnTemplates } from "../../src/routes/Boards/Legacy/legacyColumnTemplates"
import translationEn from "../../src/i18n/en/translation.json"

describe("Navigation from landing page to board", () => {
    it("should successfully login anonymously", () => {
      cy.login()
    })
  })
