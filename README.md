<div align="center" markdown="1" style="margin-bottom: 2.5em">
  <p>
    <img src="https://raw.githubusercontent.com/masinio/scrumlr.io/master/scrumlr.png" alt="scrumlr.io" style="width: 284px; max-width: 80%; height: auto;" />
  </p>
  <p>
    <a href="https://travis-ci.org/masinio/scrumlr.io" target="_blank">
        <img src="https://travis-ci.org/masinio/scrumlr.io.svg?branch=master" alt="Build status" />
    </a>
    <a href="https://codecov.io/gh/masinio/scrumlr.io" target="_blank">
      <img src="https://codecov.io/gh/masinio/scrumlr.io/branch/master/graph/badge.svg" />
    </a>
    <a href="https://beta.gemnasium.com/projects/github.com/masinio/scrumlr.io" target="_blank">
      <img src="https://beta.gemnasium.com/badges/github.com/masinio/scrumlr.io.svg" alt="Dependency Status" />
    </a>
    <a href="https://www.browserstack.com/automate/public-build/d1hHdzAreUJ6cnByVHlVNVlET3lWU2g4YVA2am51MXczVzFCVk14SjNPQT0tLXUxMEpKQlBvQ2xhZ2MyNVhuNWZBaVE9PQ==--2d493680853e126d56d28f5c8cc8385a3f56292a%" target="_blank">
        <img src='https://www.browserstack.com/automate/badge.svg?badge_key=d1hHdzAreUJ6cnByVHlVNVlET3lWU2g4YVA2am51MXczVzFCVk14SjNPQT0tLXUxMEpKQlBvQ2xhZ2MyNVhuNWZBaVE9PQ==--2d493680853e126d56d28f5c8cc8385a3f56292a%'/>
    </a>
    <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fmasinio%2Fscrumlr.io?ref=badge_shield" alt="FOSSA Status" target="_blank">
        <img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmasinio%2Fscrumlr.io.svg?type=shield"/>
    </a>
  </p>
</div>

Webapp for collaborative online retrospectives hosted on [scrumlr.io](https://scrumlr.io).

This project is written in React and its data is stored in a Firebase database.
The database rules are manifested in `database.rules.json`.

The webapp is hosted on Firebase. The [staging](https://staging.scrumlr.io) system is always
up to date with the `master` branch and is the target for the end-to-end tests.

## Development

### Getting started

```bash
yarn install
yarn start
# go to localhost:3000
```

You can open a pull request anytime, just make sure that the jobs `yarn test` and `yarn lint`
are passing and that every change is covered by unit tests.

## Thank you

Thanks to all our users, contributors & supporters!

### Browserstack

We are grateful to [BrowserStack](https://www.browserstack.com) for our open source account to the end-to-end test infrastructure.

<div align="center" markdown="1">
    <a href="https://www.browserstack.com" target="_blank">
        <img src="https://raw.githubusercontent.com/masinio/scrumlr.io/master/browserstack.png" style="width: 600px; max-width: 80%; height: auto;" alt="BrowserStack" />
    </a>
</div>

## License

Scrumlr is [MIT licensed](https://github.com/masinio/scrumlr.io/blob/tech/doc/LICENSE).