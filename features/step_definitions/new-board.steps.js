
const {Then, When} = require('cucumber');
const webdriver = require('selenium-webdriver');

When(/^I visit the homepage$/, function (next) {
  this.driver.get(this.url).then(next);
});

When(/^I'm not logged in$/, (next) => {
  next();
});

Then(/^I should be able to create a new board$/, function () {
  this.driver.wait(webdriver.until.elementLocated(webdriver.By.className("board-page")));
});