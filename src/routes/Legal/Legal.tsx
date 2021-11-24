import {useTranslation} from "react-i18next";
import {FC} from "react";
import "./Legal.scss";

const marked = require("marked");

export interface LegalProps {
  document: "privacyPolicy" | "termsAndConditions" | "cookiePolicy";
}

/* import("./test.md").then((result) => {
    fetch(result.default)
    .then((response) => response.text())
    .then((text) => {
      // ...
    });
  }); */

export var Legal: FC<LegalProps> = function ({document}) {
  const {t} = useTranslation();

  const text = marked.parse(t(`Legal.${document}`) as string);

  return (
    <div className="legal">
      <div className="legal__text" dangerouslySetInnerHTML={{__html: text}} />
    </div>
  );
};
