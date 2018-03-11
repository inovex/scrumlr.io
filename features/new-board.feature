Feature: Create a new board

  Scenario: Create new board without user account
    When I visit the homepage
    And I'm not logged in
    And I click on the "Start" button
    Then I should be able to create a new board