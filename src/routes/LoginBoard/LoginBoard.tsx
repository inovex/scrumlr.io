import {RouteComponentProps, useHistory} from "react-router";
import {getRandomName} from "constants/name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {useTranslation} from "react-i18next";

export function LoginBoard(props: RouteComponentProps) {
  const {t} = useTranslation();

  const [displayName, setDisplayName] = useState(getRandomName());
  const history = useHistory<{from: {pathname: string}}>();

  // anonymous sign in and redirection to boardpath that is in history
  async function handleLogin() {
    await AuthenticationManager.signInAnonymously(displayName);
    try {
      props.history.push(history.location.state.from.pathname);
    } catch (err) {
      Toast.error(t("LoginBoard.errorOnRedirect"));
    }
  }

  return (
    <div className="login-board">
      <input
        className="login-board__input"
        defaultValue={displayName}
        type="text"
        onChange={(e) => setDisplayName(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
        maxLength={20}
      />
      <button onClick={handleLogin}>{t("LoginBoard.joinAnonymous")}</button>
      <LoginProviders originURL={history.location.state.from.pathname} />
    </div>
  );
}
