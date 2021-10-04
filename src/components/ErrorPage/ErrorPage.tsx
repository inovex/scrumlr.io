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
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Home
        </button>
        <button
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
