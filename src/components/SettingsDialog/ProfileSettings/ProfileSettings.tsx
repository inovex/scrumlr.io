import classNames from "classnames";
import {useEffect, useRef, useState} from "react";
import Parse from "parse";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {UserServerModel} from "types/user";
import {ApplicationState} from "types/store";
import {SettingsButton} from "../Components/SettingsButton";
import "./ProfileSettings.scss";

export const ProfileSettings = () => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()?.id),
  }));

  const [userName, setUserName] = useState<string | undefined>();

  useEffect(() => setUserName(state.user?.displayName), [state.user?.displayName]);

  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">Profile</h2>
      </header>
      <div className="profile-settings__container">
        {userName && (
          <SettingsButton className="profile-settings__user-name-button" label="User Name" onClick={() => nameInputRef.current?.focus()}>
            <input
              ref={nameInputRef}
              className="profile-settings__user-name-button_input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && state.user && userName && store.dispatch(ActionFactory.updateUser({...(state.user as unknown as UserServerModel), displayName: userName}))
              }
              onBlur={() => state.user && userName && store.dispatch(ActionFactory.updateUser({...(state.user as unknown as UserServerModel), displayName: userName}))}
            />
          </SettingsButton>
        )}
      </div>
    </div>
  );
};
