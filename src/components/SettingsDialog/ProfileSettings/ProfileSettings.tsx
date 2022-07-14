import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import "./ProfileSettings.scss";
import {useDispatch} from "react-redux";
import {AvatarSettings} from "../Components/AvatarSettings";
import {SettingsInput} from "../Components/SettingsInput";
import {SettingsButton} from "../Components/SettingsButton";
import {Toggle} from "../../Toggle";

export const ProfileSettings = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
    hotkeysAreActive: applicationState.view.hotkeysAreActive,
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
            id="profileSettingsUserName"
            label={t("ProfileSettings.UserName")}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            submit={() => store.dispatch(Actions.editSelf({...state.participant.user, name: userName}))}
          />

          <AvatarSettings id={id} />
        </div>
        <SettingsButton
          data-testid="author"
          className="profile-settings__toggle-hotkeys-button"
          label={t("Hotkeys.hotkeyToggle")}
          onClick={() => {
            dispatch(Actions.setHotkeyState(!state.hotkeysAreActive));
          }}
        >
          <button className="profile-settings__open-cheat-sheet-button">
            <a href={`${process.env.PUBLIC_URL}/hotkeys.pdf`} target="_blank" rel="noopener noreferrer">
              ?
            </a>
          </button>
          <Toggle active={state.hotkeysAreActive} />
        </SettingsButton>
      </div>
    </div>
  );
};
