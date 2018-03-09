const {When} = require('cucumber');
const webdriver = require('selenium-webdriver');

When(/^I click on the "([^"]*)" button$/, function (buttonText, next) {
  this.driver.findElement(webdriver.By.className('new-board__action-button'))
    .then((button) => {
      button.click().then(next);
    })
});
