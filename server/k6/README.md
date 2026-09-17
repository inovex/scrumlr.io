# k6 load tests

This directory contains k6 load tests to run against the scrumlr backend.

## Installation

To install k6 on your machine follow the [installation guid from k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
After you installed k6 on your machine, install the packages for the type definitions.
For that run

```bash
yarn install
```

You can also install the k6 extensions either for [VS Code](https://marketplace.visualstudio.com/items?itemName=k6.k6)
or [IntelliJ](https://plugins.jetbrains.com/plugin/16141-k6).

For more information how to setup k6 go tothe [k6 setup documentation](https://grafana.com/docs/k6/latest/set-up/).

## Run k6 tests

The following test suits are available

- [e2e](./src/e2e.ts)
-

### Run tests

To run k6 tests you can either use the `k6 run` command or start them using `yarn`.
With `yarn` all available test suits are pre configured running against `http://localhost:8080` and collecting no usage data.

#### Usage collection

k6 collects anonymous usage reports with each run of a k6 test. To disable this behaviour either set the environment
variable `K6_NO_USAGE_REPORT` or add the flag `--no-usage-report`.

For more information read the [k6 documentation](https://grafana.com/docs/k6/latest/set-up/usage-collection/).

### e2e test suite

The [e2e](./src/e2e.ts) is configured with one virtual user and one iteration.
It checks most of the available endpoints of the scrumlr backend.
To run these tests run

```bash
yarn e2e
```

This will run the [e2e](./src/e2e.ts) tests suite against `http://localhost:8080`.
If you want to run the tests a *test* deployment change the `BASEURL` through setting the environment variable like

```bash
BASEURL=http://localhost:8080/api yarn e2e
```
