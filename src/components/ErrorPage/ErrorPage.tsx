import "./ErrorPage.scss";

export interface ErrorPageProps {
  errorMessage: string;
}

function ErrorPage({errorMessage}: ErrorPageProps) {
  return (
    <section className="error-page">
      <span>{errorMessage}</span>
    </section>
  );
}

export default ErrorPage;
