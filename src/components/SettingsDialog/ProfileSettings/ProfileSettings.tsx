import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useRef, useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {SettingsButton} from "../Components/SettingsButton";
import "./ProfileSettings.scss";
import {AvatarSettings} from "../Components/AvatarSettings";

export const ProfileSettings = () => {
  const {t} = useTranslation();
  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
  }));

  const [userName, setUserName] = useState<string | undefined>(state.participant?.user.name);
  const [id] = useState<string | undefined>(state.participant?.user.id);

  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("ProfileSettings.Profile")}</h2>
      </header>
      <div className="profile-settings__container">
        <SettingsButton className="profile-settings__user-name-button" label={t("ProfileSettings.UserName")} onClick={() => nameInputRef.current?.focus()}>
          <input
            ref={nameInputRef}
            className="profile-settings__user-name-button_input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && state.participant && userName && store.dispatch(Actions.editSelf({id: state.participant.user.id, name: userName}))}
            onBlur={() => state.participant && userName && store.dispatch(Actions.editSelf({id: state.participant.user.id, name: userName}))}
          />
        </SettingsButton>

        <AvatarSettings id={id} />
      </div>
    </div>
  );
};
