var {After} = require('cucumber');

After(function () {
  return this.driver.quit();
});