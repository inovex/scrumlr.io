import "./ErrorPage.scss";
import {useHistory} from "react-router";
import {useTranslation} from "react-i18next";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

export function ErrorPage({errorMessage, originURL}: ErrorPageProps) {
  const {t} = useTranslation();

  const history = useHistory();
  const redirect = (newURL: string) => () => {
    history.push(newURL);
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
