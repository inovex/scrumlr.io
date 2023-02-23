<div align="center" markdown="1" style="margin-bottom: 2.5em">
  <p>
    <img src="scrumlr.png" alt="scrumlr.io" style="width: 284px; max-width: 80%; height: auto;" />
  </p>
  <p>
    <a href="https://github.com/inovex/scrumlr.io/actions/workflows/continuous-integration.yml">
      <img src="https://github.com/inovex/scrumlr.io/actions/workflows/continuous-integration.yml/badge.svg?branch=main"/>
    </a>
  </p>
</div>

Webapp for collaborative online retrospectives hosted on [scrumlr.io](https://scrumlr.io).
Read our ['Welcome' wiki page](https://github.com/inovex/scrumlr.io/wiki/Welcome) to learn more
about the history and the vision of this tool.

We developed the client with the help of [React](https://reactjs.org/) while our server is implemented in [Go](https://go.dev/).

# Getting Started

Checkout the sources.

```bash
$ git clone https://github.com/inovex/scrumlr.io.git
$ cd scrumlr.io
```

## Prerequisites

- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)
- [Go](https://go.dev/dl/)
- [Docker](https://www.docker.com/)
- _(optional)_ [minikube](https://kubernetes.io/docs/tasks/tools/)
- _(optional)_ [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Run

1. run the server (backend) with docker

    ```bash
    $ docker compose --project-directory server/ --profile build up -d
    ```

    *If server code has been changed make sure to run it with the `--build` option.


2. run the client (frontend)

    ```bash
    $ yarn install
    $ yarn start
    ```

   The client will become available on [http://localhost:3000](http://localhost:3000)

## Contributing

You're very welcome to be part of this project. You can contribute by opening an issue, by
fixing a bug or by adding a feature and open a pull request. Just make sure that the jobs
`yarn test` and `yarn lint` are passing and that every change is covered by unit tests.

## Our team and beloved friends

[<img src="https://avatars.githubusercontent.com/u/36969812?s=48&amp;v=4" width="48" height="48" alt="brandstetterm">](https://github.com/brandstetterm)
[<img src="https://avatars.githubusercontent.com/u/35272402?s=48&amp;v=4" width="48" height="48" alt="Resaki1">](https://github.com/Resaki1)
[<img src="https://avatars.githubusercontent.com/u/49522775?s=48&amp;v=4" width="48" height="48" alt="Benjosh95">](https://github.com/Benjosh95)
[<img src="https://avatars.githubusercontent.com/u/44020029?s=48&amp;v=4" width="48" height="48" alt="CronJorian">](https://github.com/CronJorian)
[<img src="https://avatars.githubusercontent.com/u/79283124?v=4&amp;v=4" width="48" height="48" alt="Lennart01">](https//github.com/lennart01)
[<img src="https://avatars.githubusercontent.com/u/1539948?s=48&amp;v=4" width="48" height="48" alt="bitionaire">](https://github.com/bitionaire)
[<img src="https://avatars.githubusercontent.com/u/88541778?s=48&amp;v=4" width="48" height="48" alt="dbaderINO">](https://github.com/dbaderINO)
[<img src="https://avatars.githubusercontent.com/u/105675885?s=48&amp;v=4" width="48" height="48" alt="Kraft16">](https://github.com/Kraft16)
[<img src="https://avatars.githubusercontent.com/u/5772868?s=48&amp;v=4" width="48" height="48" alt="miiho">](https://github.com/miiho)
[<img src="https://avatars.githubusercontent.com/u/70689411?s=48&amp;v=4" width="48" height="48" alt="brandeins1403">](https://github.com/brandeins1403)
[<img src="https://avatars.githubusercontent.com/u/56362368?s=48&v=4" width="48" height="48" alt="benedicthomuth">](https://github.com/benedicthomuth)
[<img src="https://avatars.githubusercontent.com/u/7889564?s=48&amp;v=4" width="48" height="48" alt="schwehn42">](https://github.com/schwehn42)
[<img src="https://avatars.githubusercontent.com/u/116653219?s=48&amp;v=4" width="48" height="48" alt="SelinaBuff">](https://github.com/SelinaBuff)

[<img src="https://avatars.githubusercontent.com/u/741171?s=36&amp;v=4" width="36" height="36" alt="cdreier">](https://github.com/wlbr)
[<img src="https://avatars.githubusercontent.com/u/5778920?s=36&amp;v=4" width="36" height="36" alt="cdreier">](https://github.com/bontscho)
[<img src="https://avatars.githubusercontent.com/u/60005702?s=36&amp;v=4" width="36" height="36" alt="Dominik-Weinzierl">](https://github.com/Dominik-Weinzierl)
[<img src="https://avatars.githubusercontent.com/u/86951527?s=36&amp;v=4" width="36" height="36" alt="andiKandi">](https://github.com/andiKandi)
[<img src="https://avatars.githubusercontent.com/u/97038583?s=36&amp;v=4" width="36" height="36" alt="jdolinga">](https://github.com/jdolinga)
[<img src="https://avatars.githubusercontent.com/u/5882421?s=36&amp;v=4" width="36" height="36" alt="busilina">](https://github.com/busilina)
[<img src="https://avatars.githubusercontent.com/u/400103?s=36&amp;v=4" width="36" height="36" alt="doppelreim">](https://github.com/doppelreim)
[<img src="https://avatars.githubusercontent.com/u/28045496?s=36&amp;v=4" width="36" height="36" alt="alphapfote">](https://github.com/alphapfote)
[<img src="https://avatars.githubusercontent.com/u/23505569?s=36&amp;v=4" width="36" height="36" alt="orangehelicopter">](https://github.com/orangehelicopter)
[<img src="https://avatars.githubusercontent.com/u/24627030?s=36&amp;v=4" width="36" height="36" alt="theexiile1305">](https://github.com/theexiile1305)
[<img src="https://avatars.githubusercontent.com/u/8872752?s=36&amp;v=4" width="36" height="36" alt="theinrichs">](https://github.com/theinrichs)
[<img src="https://avatars.githubusercontent.com/u/731608?s=36&amp;v=4" width="36" height="36" alt="cdreier">](https://github.com/cdreier)
[<img src="https://avatars.githubusercontent.com/u/3976183?s=36&v=4" width="36" height="36" alt="dotcs">](https://github.com/dotcs)
[<img src="https://avatars.githubusercontent.com/u/32651718?s=36&amp;v=4" width="36" height="36" alt="timengel">](https://github.com/timengel)
[<img src="https://avatars.githubusercontent.com/u/68269653?s=36&amp;v=4" width="36" height="36" alt="louiskroener">](https://github.com/louiskroener)
[<img src="https://avatars.githubusercontent.com/u/58441634?s=3648&amp;v=4" width="36" height="36" alt="NNKKOO">](https://github.com/NNKKOO)

... and many more!

## Thank you

Thanks to all our users, contributors & supporters! ❤️

<a href="https://inovex.de">
<img src="https://www.inovex.de/wp-content/uploads/2020/10/inovex-logo-dunkelblau-quadrat-1.svg" alt="inovex">
</a>

A special shout-out goes to [inovex](https://inovex.de) for all the support and the opportunity to realize this project! 🙌
[Contact us](https://www.inovex.de/de/kontakt/) if you look for the best IT service provider out there.

## License

Scrumlr is [MIT licensed](https://github.com/inovex/scrumlr.io/blob/main/LICENSE).
