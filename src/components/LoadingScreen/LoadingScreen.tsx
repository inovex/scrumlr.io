import "./LoadingScreen.scss";
import {LoadingIndicator} from "components/LoadingIndicator";

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <LoadingIndicator />
    </div>
  );
}
