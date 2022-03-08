import {VFC} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./NotFound.scss";

export const NotFound: VFC = () => (
  <div className="not-found">
    <ScrumlrLogo className="not-found__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
    <p className="not-found__text">404 | Page not found</p>
  </div>
);
