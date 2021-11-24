import {FC} from "react";
import {ReactComponent as GitHubIcon} from "assets/icon-github.svg";
import "./AppInfo.scss";
import classNames from "classnames";
import {useTranslation} from "react-i18next";

export interface AppInfoProps {
  className?: string;
}

export var AppInfo: FC<AppInfoProps> = function ({className}) {
  const {t} = useTranslation();

  return (
    <a target="_blank" href="https://github.com/inovex/scrumlr.io/releases" aria-label={t("AppInfo.version")} className={classNames("app-info", className)} rel="noreferrer">
      <GitHubIcon className="app-info__icon" aria-hidden />
      <span>{process.env.REACT_APP_VERSION}</span>
    </a>
  );
};
