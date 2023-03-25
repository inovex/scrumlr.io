import "./NotFound.scss";
import {ReactComponent as StanToilet} from "assets/stan/stan-toilet.svg";
import {ReactComponent as Logo404} from "assets/pages/error/404.svg";

export const NotFound = () => (
  <div className="not-found__root">
    <header className="not-found__header">
      <div className="scrumlr-logo">logo</div>
    </header>
    <main className="not-found__main">
      <div className="not-found__content">
        <div className="not-found__title">Oh no! Error</div>
        <div className="not-found__description">Maybe Stan has broken this page.</div>
        <button className="not-found__return-button">Back to Homepage</button>
      </div>
      <div className="not-found__background">
        <Logo404 className="not-found__logo404" />
        <StanToilet className="not-found__logo-stan" />
      </div>
    </main>
  </div>
);
