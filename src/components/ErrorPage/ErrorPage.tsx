import "./ErrorPage.scss";

export interface ErrorPageProps {
  errorMessage: string;
}

function ErrorPage({errorMessage}: ErrorPageProps) {
  return (
    <div className="error-page">
      <span>{errorMessage}</span>
    </div>
  );
}

export default ErrorPage;
