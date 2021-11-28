import {useTranslation, withTranslation} from "react-i18next";
import {FC, useEffect, useState} from "react";
import "./Legal.scss";
import {generatePath, useNavigate} from "react-router";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {Portal} from "../../components/Portal";
import {Button} from "../../components/Button";

const marked = require("marked");

export interface LegalProps {
  document: "privacyPolicy" | "termsAndConditions" | "cookiePolicy";
}

const LegalWithoutTranslation: FC<LegalProps> = function ({document}) {
  const {i18n} = useTranslation();
  const navigate = useNavigate();
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

  const handleClose = () => {
    navigate("/");
  };

  const markdownText = marked.parse(text);

  return (
    <Portal centered darkBackground onClose={handleClose}>
      <div className="legal">
        <Button className="legal__close" variant="outlined" onClick={handleClose} leftIcon={<CloseIcon />} hideLabel>
          Close
        </Button>
        <div className="legal__text" dangerouslySetInnerHTML={{__html: markdownText}} />
      </div>
    </Portal>
  );
};

export const Legal = withTranslation()(LegalWithoutTranslation);
