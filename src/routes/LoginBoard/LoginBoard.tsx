import {useNavigate} from "react-router-dom";
import {getRandomName} from "constants/name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {useTranslation} from "react-i18next";
import {useLocation} from "react-router";

export var LoginBoard = function () {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(getRandomName());

  // anonymous sign in and redirection to boardpath that is in history
  async function handleLogin() {
    await AuthenticationManager.signInAnonymously(displayName);
    try {
      navigate(location.state.from.pathname);
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
      <LoginProviders originURL={location.state.from.pathname} />
    </div>
  );
};
