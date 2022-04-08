import classNames from "classnames";
import {useRef, useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {SettingsButton} from "../Components/SettingsButton";
import "./ProfileSettings.scss";

export const ProfileSettings = () => {
  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
  }));

  const [userName, setUserName] = useState<string | undefined>(state.participant?.user.name);

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
                e.key === "Enter" &&
                state.participant &&
                userName &&
                store.dispatch(Actions.editParticipant({...state.participant, user: {...state.participant.user, name: userName}}))
              }
              onBlur={() => state.participant && userName && store.dispatch(Actions.editParticipant({...state.participant, user: {...state.participant.user, name: userName}}))}
            />
          </SettingsButton>
        )}
      </div>
    </div>
  );
};
