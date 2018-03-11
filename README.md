<div align="center" markdown="1">
  <p>
    <img src="https://raw.githubusercontent.com/masinio/scrumlr.io/master/scrumlr.png" alt="scrumlr.io" width="284" height="121" />
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
  </p>
</div>

Webapp for collaborative online retrospectives hosted on [scrumlr.io](https://scrumlr.io).

This project is written in React and its data is stored in a Firebase database.
The database rules are manifested in `database-rules.json`.



## Getting started

```bash
yarn install
yarn start
# go to localhost:3000
```

## Public availability

The latest considered stable version is hosted on [scrumlr.io](https://scrumlr.io).

The latest `master` build is always available on the staging URL [staging.scrumlr.io](https://staging.scrumlr.io).
While the E2E test suite is not large enough to guarantee a working app, releases will be performed manually.
