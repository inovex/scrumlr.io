import classNames from "classnames";
import {useRef} from "react";
import {useAppSelector} from "store";
import Parse from "parse";
import {SettingsButton} from "../Components/SettingsButton";
import "./ProfileSettings.scss";

export const ProfileSettings = () => {
  const userName = useAppSelector((applicationState) => applicationState.users.all.find((user) => user.id === Parse.User.current()?.id)?.displayName);

  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">Profile</h2>
      </header>
      <div className="profile-settings__container">
        <SettingsButton className="profile-settings__user-name-button" label="User Name" onClick={() => nameInputRef.current?.focus()}>
          <input ref={nameInputRef} className="profile-settings__user-name-button_input" value={userName} /* onChange={(e) => setUserName(e.target.value)} */ />
        </SettingsButton>
      </div>
    </div>
  );
};
