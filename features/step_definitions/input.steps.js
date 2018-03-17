const {When} = require('cucumber');
const webdriver = require('selenium-webdriver');

When(/^I click on the "([^"]*)" button$/, function (buttonText, next) {
  this.driver.findElement(webdriver.By.xpath(`//button[text()='${buttonText}']`))
    .then((button) => {
      button.click().then(next);
    })
});

When(/^I click on the button with class "([^"]*)"$/, function (className, next) {
  this.driver.findElement(webdriver.By.className(className))
    .then((button) => {
      button.click().then(next);
    })
});




