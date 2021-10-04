import "./ErrorPage.scss";

export interface ErrorPageProps {
  errorMessage: string;
  originURL: string;
}

function ErrorPage({errorMessage, originURL}: ErrorPageProps) {
  return (
    <>
      <section className="error-page">
        <span>{errorMessage}</span>
        <button
          id="home-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Home
        </button>
        <button
          id="back-button"
          onClick={() => {
            window.location.href = originURL;
          }}
        >
          Go Back
        </button>
      </section>
    </>
  );
}

export default ErrorPage;
