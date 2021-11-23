import {Trans} from "react-i18next";

export var AppInfo = function () {
  const version = <a href="https://github.com/inovex/scrumlr.io/releases" />;

  return (
    <div>
      <Trans i18nKey="AppInfo.version" values={{version: process.env.REACT_APP_VERSION}} components={[version]} />
    </div>
  );
};
