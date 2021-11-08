import "./ErrorPage.scss";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

export function ErrorPage({errorMessage, originURL}: ErrorPageProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const redirect = (newURL: string) => () => {
    navigate(newURL);
  };
  return (
    <>
      <section className="error-page">
        <span>{errorMessage}</span>
        <button data-testid="home-button" onClick={redirect("/")}>
          {t("ErrorPage.navigateHome")}
        </button>
        <button data-testid="back-button" onClick={redirect(originURL)}>
          {t("ErrorPage.navigateBack")}
        </button>
      </section>
    </>
  );
}
