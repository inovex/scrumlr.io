/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import { legacyColumnTemplates } from "../../src/routes/Boards/Legacy/legacyColumnTemplates"
import translationEn from "../../src/i18n/en/translation.json"

describe("navigation from homepage", () => {
    it("should successfully login anonymously", () => {
      cy.login()
    })
  })
