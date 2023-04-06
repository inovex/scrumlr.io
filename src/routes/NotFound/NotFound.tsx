import "./NotFound.scss";
import {ReactComponent as StanWebLight} from "assets/stan/Stan_404_Web_Light.svg";

export const NotFound = () => (
  <div className="not-found__root">
    <header className="not-found__header">
      <div className="scrumlr-logo">logo</div>
    </header>
    <main className="not-found__main">
      <div className="not-found__content">
        <div className="not-found__title">Oh no! Error</div>
        <div className="not-found__description">
          <div>Maybe Stan has broken this page.</div>
          <div>Go back to the Homepage.</div>
        </div>
        <button className="not-found__return-button">Back to Homepage</button>
      </div>
      <div className="not-found__image-wrapper">
        <StanWebLight className="not-found__logo-stan--web-light" />
      </div>
    </main>
  </div>
);
