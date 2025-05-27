import "./ErrorPage.scss";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {LegacyButton} from "components/Button";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

export const ErrorPage = ({errorMessage, originURL}: ErrorPageProps) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const redirect = (newURL: string) => () => {
    navigate(newURL);
  };
  return (
    <section className="error-page">
      <span>{errorMessage}</span>
      <LegacyButton data-testid="home-button" onClick={redirect("/")}>
        {t("ErrorPage.navigateHome")}
      </LegacyButton>
      <button data-testid="back-button" onClick={redirect(originURL)}>
        {t("ErrorPage.navigateBack")}
      </button>
    </section>
  );
};
