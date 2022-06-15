import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import "./ProfileSettings.scss";
import {AvatarSettings} from "../Components/AvatarSettings";
import {SettingsInput} from "../Components/SettingsInput";

export const ProfileSettings = () => {
  const {t} = useTranslation();
  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
  }));

  const [userName, setUserName] = useState<string>(state.participant?.user.name);
  const [id] = useState<string | undefined>(state.participant?.user.id);

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("ProfileSettings.Profile")}</h2>
      </header>
      <div className="profile-settings__container-wrapper">
        <div className="profile-settings__container">
          <SettingsInput
            label={t("ProfileSettings.UserName")}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            submit={() => store.dispatch(Actions.editSelf({id: state.participant.user.id, name: userName}))}
          />

          <AvatarSettings id={id} />
        </div>
      </div>
    </div>
  );
};
