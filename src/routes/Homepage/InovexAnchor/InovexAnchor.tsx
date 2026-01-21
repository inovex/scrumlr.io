import {FC, PropsWithChildren} from "react";
import {InovexIcon} from "components/Icon";
import "./InovexAnchor.scss";

export const InovexAnchor: FC<PropsWithChildren> = ({children}) => (
  <a href="https://www.inovex.de/" target="_blank" className="inovex-anchor" rel="noreferrer">
    <InovexIcon className="inovex-anchor__logo" />
    {children}
  </a>
);
