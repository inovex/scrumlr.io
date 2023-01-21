import {FC} from "react";
import InovexLogo from "assets/icon-inovex.svg";
import "./InovexAnchor.scss";

export const InovexAnchor: FC = ({children}) => (
  <a href="https://www.inovex.de/" target="_blank" className="inovex-anchor" rel="noreferrer">
    <img src={InovexLogo} className="inovex-anchor__logo" width={16} height={16} alt="inovex" />
    {children}
  </a>
);
