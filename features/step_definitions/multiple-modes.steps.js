const {Then,When} = require('cucumber');
const webdriver = require('selenium-webdriver');
const assert = require('assert');

Then(/^I should see multiple board modes$/, async function () {
  const wrapper = await this.driver.findElement(webdriver.By.className('start-button__dropdown-wrapper'));
  const liElements = await wrapper.findElements(webdriver.By.css('li'));

  assert(liElements.length > 1);
});

When(/^I select the "([^"]*)" mode$/, function (buttonText, next) {
  this.driver.findElement(webdriver.By.className('start-button__dropdown-wrapper')).then((wrapper) => {
    wrapper.findElement(webdriver.By.xpath(`//button[text()='${buttonText}']`)).then((button) => {
      button.click().then(next);
    })
  });
});

