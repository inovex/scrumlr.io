import {FC} from "react";
import InovexLogo from "assets/icon-inovex.svg";
import "./InovexAnchor.scss";

export var InovexAnchor: FC = function ({children}) {
  return (
    <a href="https://www.inovex.de/" target="_blank" className="inovex-anchor" rel="noreferrer">
      <img src={InovexLogo} className="inovex-anchor__logo" />
      {children}
    </a>
  );
};
