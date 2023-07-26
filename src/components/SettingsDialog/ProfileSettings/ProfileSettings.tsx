import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useContext, useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {Button} from "components/Button";
import {AvatarSettings} from "../Components/AvatarSettings";
import {SettingsInput} from "../Components/SettingsInput";
import {SettingsContext} from "../SettingsContext";
import {SettingsFooter} from "../Components/SettingsFooter";
import "./ProfileSettings.scss";

export const ProfileSettings = () => {
  const {settings} = useContext(SettingsContext);
  const {t} = useTranslation();
  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
    hotkeysAreActive: applicationState.view.hotkeysAreActive,
  }));
  const [userName, setUserName] = useState<string>(state.participant?.user.name);
  const [id] = useState<string | undefined>(state.participant?.user.id);
  const [saved, setSaved] = useState<boolean>(false);
  const [canceled, setCanceled] = useState<boolean>(false);
  const isFooterVisible = settings?.profile?.unsavedAvatarChanges !== undefined;

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("ProfileSettings.Profile")}</h2>
      </header>
      <div className="profile-settings__container-wrapper">
        <div className="profile-settings__container">
          <SettingsInput
            id="profileSettingsUserName"
            label={t("ProfileSettings.UserName")}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            submit={() => store.dispatch(Actions.editSelf({...state.participant.user, name: userName}))}
          />

          <AvatarSettings id={id} saved={saved} setSaved={setSaved} canceled={canceled} setCanceled={setCanceled} />
        </div>
      </div>
      {isFooterVisible && (
        <SettingsFooter>
          <Button variant="outlined" color="inherit" onClick={() => setCanceled(true)}>
            {t("ProfileSettings.Cancel")}
          </Button>
          <Button color="inherit" onClick={() => setSaved(true)}>
            {t("ProfileSettings.SaveAvatar")}
          </Button>
        </SettingsFooter>
      )}
    </div>
  );
};
