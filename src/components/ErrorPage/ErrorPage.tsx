import "./ErrorPage.scss";
import {useHistory} from "react-router";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

function ErrorPage({errorMessage, originURL}: ErrorPageProps) {
  const history = useHistory();
  const redirect = (newURL: string) => () => {
    history.push(newURL);
  };
  return (
    <>
      <section className="error-page">
        <span>{errorMessage}</span>
        <button data-testid="home-button" onClick={redirect("/")}>
          Home
        </button>
        <button data-testid="back-button" onClick={redirect(originURL)}>
          Go Back
        </button>
      </section>
    </>
  );
}

export default ErrorPage;
