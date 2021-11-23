import {Trans} from "react-i18next";
import {FC} from "react";

export interface AppInfoProps {
  className?: string;
}

export var AppInfo: FC<AppInfoProps> = function({className}) {
  const version = <a href="https://github.com/inovex/scrumlr.io/releases" />;

  return (
    <div className={className}>
      <Trans i18nKey="AppInfo.version" values={{version: process.env.REACT_APP_VERSION}} components={[version]} />
    </div>
  );
}
