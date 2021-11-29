import "./ErrorPage.scss";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

export var ErrorPage = function ({errorMessage, originURL}: ErrorPageProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const redirect = (newURL: string) => () => {
    navigate(newURL);
  };
  return (
    <section className="error-page">
      <span>{errorMessage}</span>
      <Button data-testid="home-button" onClick={redirect("/")}>
        {t("ErrorPage.navigateHome")}
      </Button>
      <button data-testid="back-button" onClick={redirect(originURL)}>
        {t("ErrorPage.navigateBack")}
      </button>
    </section>
  );
};
