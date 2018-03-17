Feature: Multiple board modes

  Scenario: Create new board without user account
    When I visit the homepage
    And I'm not logged in
    And I click on the button with class "start-button__dropdown-toggle"
    Then I should see multiple board modes

  Scenario: Create a new lean coffee board
    When I visit the homepage
    And I'm not logged in
    And I click on the button with class "start-button__dropdown-toggle"
    And I select the "Lean Coffee" mode
    And I click on the button with class "start-button__start"
    Then I should be able to create a new board

  Scenario: Create a new simple retrospective board
    When I visit the homepage
    And I'm not logged in
    And I click on the button with class "start-button__dropdown-toggle"
    And I select the "Simple Retro" mode
    And I click on the button with class "start-button__start"
    Then I should be able to create a new board

  Scenario: Create a new start stop continue board
    When I visit the homepage
    And I'm not logged in
    And I click on the button with class "start-button__dropdown-toggle"
    And I select the "Start, Stop, Continue" mode
    And I click on the button with class "start-button__start"
    Then I should be able to create a new board
