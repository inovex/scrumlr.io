import "./ErrorPage.scss";
import {useNavigate} from "react-router-dom";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

export function ErrorPage({errorMessage, originURL}: ErrorPageProps) {
  const navigate = useNavigate();
  const redirect = (newURL: string) => () => {
    navigate(newURL);
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
