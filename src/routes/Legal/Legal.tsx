import {useTranslation, withTranslation} from "react-i18next";
import {FC, useEffect, useState} from "react";
import "./Legal.scss";
import {generatePath} from "react-router";
import {marked} from "marked";
import {ScrumlrLogo} from "../../components/ScrumlrLogo";

export interface LegalProps {
  document: "privacyPolicy" | "termsAndConditions" | "cookiePolicy";
}

const LegalWithoutTranslation: FC<LegalProps> = ({document}) => {
  const {i18n} = useTranslation();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (i18n.resolvedLanguage) {
      const legalDocument = generatePath(`/locales/:lang/${document}.md`, {lang: i18n.resolvedLanguage || "en"});

      fetch(legalDocument)
        .then((response) => response.text())
        .then((fetchedText) => {
          setText(fetchedText);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.resolvedLanguage]);

  const markdownText = marked.parse(text, {async: false}) as string;

  return (
    <div className="legal">
      <a href="/" aria-label="Homepage">
        <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      </a>

      <div
        className="legal__text"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: markdownText}}
      />
    </div>
  );
};

export const Legal = withTranslation()(LegalWithoutTranslation);
