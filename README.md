> The code of the online version of [scrumlr.io](https://scrumlr.io) is located
> [at the v1 branch](https://github.com/inovex/scrumlr.io/tree/v1), since we are currently working on a new 
> implementation of your favorite webapp for collaborative sessions.

<div align="center" markdown="1" style="margin-bottom: 2.5em">
  <p>
    <img src="scrumlr.png" alt="scrumlr.io" style="width: 284px; max-width: 80%; height: auto;" />
  </p>
  <p>
    <a href="https://depfu.com" alt="Dependency Status">
      <img src="https://badges.depfu.com/badges/e64e883c9b747da1bb9ea8e24759a2aa/status.svg"/>
    </a>
    <a href="https://depfu.com/github/inovex/scrumlr.io?project_id=17033" alt="Dependency Status">
      <img src="https://badges.depfu.com/badges/e64e883c9b747da1bb9ea8e24759a2aa/overview.svg"/>
    </a>
    <a href="https://depfu.com/github/inovex/scrumlr.io?project_id=17033" alt="Dependency Status">
      <img src="https://badges.depfu.com/badges/e64e883c9b747da1bb9ea8e24759a2aa/count.svg"/>
    </a>
  </p>
</div>

Webapp for collaborative online retrospectives hosted on [scrumlr.io](https://scrumlr.io).

This project is written in React on top of the [Parse Platform](https://parseplatform.org/).

## Run

1. run the server (backend) with docker

    ```
    cd server
    docker-compose up -d
    ```

    *If server code has been changed make sure to run it with the **--build** option:* `docker-compose up -d --build`

2. run the client (frontend)

    ```
    yarn install
    yarn start
    ```

## Contributing

You're very welcome to be part of this project. You can contribute by opening an issue, by
fixing a bug or by adding a feature and open a pull request. Just make sure that the jobs
`yarn test` and `yarn lint` are passing and that every change is covered by unit tests.

## Thank you

Thanks to all our users, contributors & supporters!

## License

Scrumlr is [MIT licensed with Commons Clause](https://github.com/inovex/scrumlr.io/blob/main/LICENSE).
