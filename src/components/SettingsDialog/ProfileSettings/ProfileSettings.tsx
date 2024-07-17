import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {Info} from "components/Icon";
import {Toggle} from "components/Toggle";
import {isEqual} from "underscore";
import {useOutletContext} from "react-router";
import {MenuItem} from "constants/settings";
import {getColorClassName} from "constants/colors";
import {AvatarSettings} from "../Components/AvatarSettings";
import {SettingsInput} from "../Components/SettingsInput";
import {SettingsButton} from "../Components/SettingsButton";
import "./ProfileSettings.scss";

export const ProfileSettings = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const activeMenuItem: MenuItem = useOutletContext();

  const state = useAppSelector(
    (applicationState) => ({
      participant: applicationState.participants!.self,
      hotkeysAreActive: applicationState.view.hotkeysAreActive,
    }),
    isEqual
  );

  const [userName, setUserName] = useState<string>(state.participant?.user.name);
  const [id] = useState<string | undefined>(state.participant?.user.id);

  return (
    <div className={classNames("settings-dialog__container", getColorClassName(activeMenuItem.color))}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("ProfileSettings.Profile")}</h2>
      </header>
      <div className="profile-settings__container-wrapper">
        <div className="profile-settings__container">
          <SettingsInput
            id="profileSettingsUserName"
            label={t("ProfileSettings.UserName")}
            value={userName}
            maxLength={64}
            onChange={(e) => setUserName(e.target.value)}
            submit={() => store.dispatch(Actions.editSelf({...state.participant.user, name: userName}))}
          />

          <AvatarSettings id={id} />
          <div className="profile-settings__hotkey-settings">
            <SettingsButton
              className="profile-settings__toggle-hotkeys-button"
              label={t("Hotkeys.hotkeyToggle")}
              onClick={() => {
                dispatch(Actions.setHotkeyState(!state.hotkeysAreActive));
              }}
            >
              <Toggle active={state.hotkeysAreActive} />
            </SettingsButton>
            <a className="profile-settings__open-cheat-sheet-button" href={`${process.env.PUBLIC_URL}/hotkeys.pdf`} target="_blank" rel="noopener noreferrer">
              <p>{t("Hotkeys.cheatSheet")}</p>
              <Info />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
