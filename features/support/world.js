const {setWorldConstructor} = require('cucumber');
const webdriver = require('selenium-webdriver');

class CustomWorld {
  constructor() {
    const username = process.env.BROWSERSTACK_USER;
    const accessKey = process.env.BROWSERSTACK_KEY;

    if (username && accessKey) {
      this.url = 'https://staging.scrumlr.io';
      this.driver = new webdriver.Builder().
        usingServer('http://hub-cloud.browserstack.com/wd/hub').
        withCapabilities({
          'browserstack.user': username,
          'browserstack.key': accessKey,
          'browserstack.local': false,
          os : 'OS X',
          'os_version' : 'High Sierra',
          browserName: 'chrome',
          project: 'scrumlr',
          build: process.env.TRAVIS_COMMIT || 'local'
        }).
        build();
    } else {
      this.url = 'http://localhost:3000';
      const chromeCapabilities = webdriver.Capabilities.chrome();
      const chromeOptions = {
        'args': ['--test-type', '--start-maximized']
      };
      chromeCapabilities.set('chromeOptions', chromeOptions);
      this.driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
    }
  }
}

setWorldConstructor(CustomWorld);