import {useTranslation, withTranslation} from "react-i18next";
import {FC, useEffect, useState} from "react";
import "./Legal.scss";
import {generatePath} from "react-router";

const marked = require("marked");

export interface LegalProps {
  document: "privacyPolicy" | "termsAndConditions" | "cookiePolicy";
}

const LegalWithoutTranslation: FC<LegalProps> = function({document}) {
  const {i18n} = useTranslation();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (i18n.language) {
      const legalDocument = generatePath(`/locales/:lang/${document}.md`, {lang: i18n.language || "en"});

      fetch(legalDocument)
        .then((response) => response.text())
        .then((text) => {
          setText(text);
        });
    }
  }, [i18n.language]);

  const markdownText = marked.parse(text);

  return (
    <div className="legal">
      <div className="legal__text" dangerouslySetInnerHTML={{__html: markdownText}} />
    </div>
  );
}

export const Legal = withTranslation()(LegalWithoutTranslation);
