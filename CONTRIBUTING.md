# Contributing to scrumlr.io

Thank you 🙏 for looking into our contribution guide, and taking the time to improve scrumlr.io with your contribution.

At the moment we are a small community, and we're open to discuss any of your ideas in order to establish some kind of
standards here. Try to contribute to the best of our knowledge and belief, and we will treat you with respect and share
our opinion with you.

## Definition of done

Here's our definition done, which we agreed on.

* If the pull requests is based on an issue ...
  * All (sub-) tasks are done
  * All acceptance criteria are met
* The code is well implemented, e.g. passes the lint tests, uses BEM-CSS, variable names are meaningful,
  documented in-code where necessary, ...
* The light- and dark-theme are both supported and tested
* The design was implemented and is responsive for all devices and screen sizes
* The application was tested in the most commonly used browsers (e.g. Chrome, Firefox, Safari)
* All existing tests are (still) passing
* New tests were introduced for new features
* Someone reviewed the code before it got merged into our `main` branch

## FAQ

<details>
  <summary>How can I add the support for another language?</summary>

  Just copy the base configuration `public/locales/en/translation.json` into a new
  directory with your language code `public/locales/{language code}/translation.json`
  and translate all values of the JSON properly. Once you're done you can open a pull
  request and we will try to review your translation by a few samples.
</details>
