<p align="center">
  <img src="scrumlr.png" alt="scrumlr.io" />
</p>

<h3 align="center">Online retrospectives made easy</h3>
<p align="center"><a href="https://scrumlr.io">scrumlr.io</a> is an online collaboration tool that helps teams reach new heights. Start your first retrospective or collaborative session in an instant - no registration required and completely free and open source. </p>

---

<p align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/inovex/scrumlr.io?style=for-the-badge">
  <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/inovex/scrumlr.io?style=for-the-badge">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/inovex/scrumlr.io/continuous-integration.yml?style=for-the-badge">
</p>


<p align="center">
  <a href="https://scrumlr.io">
    <img src="board.png" alt="scrumlr.io" />
  </a>
</p>

## Getting Started

Checkout the sources.

```bash
$ git clone https://github.com/inovex/scrumlr.io.git
$ cd scrumlr.io
```

### Prerequisites

- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)
- [Go](https://go.dev/dl/)
- [Docker](https://www.docker.com/)
- _(optional)_ [minikube](https://kubernetes.io/docs/tasks/tools/)
- _(optional)_ [kubectl](https://kubernetes.io/docs/tasks/tools/)

### Run

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

- Missing something? Add a **Proposal** to [GitHub Discussions](https://github.com/inovex/scrumlr.io/discussions/new?category=proposals)
- Found a bug? [Report here!](https://github.com/inovex/scrumlr.io/issues)
- Want to contribute? Check out our [contribution guide.](https://github.com/inovex/scrumlr.io/blob/main/CONTRIBUTING.md)

## Our team and beloved friends

[<img src="https://avatars.githubusercontent.com/u/36969812?s=48&amp;v=4" width="48" height="48" alt="brandstetterm">](https://github.com/brandstetterm)
[<img src="https://avatars.githubusercontent.com/u/35272402?s=48&amp;v=4" width="48" height="48" alt="Resaki1">](https://github.com/Resaki1)
[<img src="https://avatars.githubusercontent.com/u/49522775?s=48&amp;v=4" width="48" height="48" alt="Benjosh95">](https://github.com/Benjosh95)
[<img src="https://avatars.githubusercontent.com/u/44020029?s=48&amp;v=4" width="48" height="48" alt="CronJorian">](https://github.com/CronJorian)
[<img src="https://avatars.githubusercontent.com/u/79283124?v=4&amp;v=4" width="48" height="48" alt="Lennart01">](https://github.com/lennart01)
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
<img src="inovex.svg" alt="inovex">
</a>

A special shout-out goes to [inovex](https://inovex.de) for all the support and the opportunity to realize this project! 🙌
[Contact us](https://www.inovex.de/de/kontakt/) if you look for the best IT service provider out there.

## License

See the [LICENSE](./LICENSE) file for licensing information.
