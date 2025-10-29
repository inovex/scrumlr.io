import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {editSelf} from "store/features";
import {useOutletContext} from "react-router";
import {MenuItemConfig} from "constants/settings";
import {getColorClassName} from "constants/colors";
import {AvatarSettings} from "../Components/AvatarSettings";
import {SettingsInput} from "../Components/SettingsInput";
import "./ProfileSettings.scss";

export const ProfileSettings = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const activeMenuItem: MenuItemConfig = useOutletContext();

  const self = useAppSelector((state) => state.auth.user!);

  const [userName, setUserName] = useState<string>(self.name);
  const [id] = useState<string | undefined>(self.id);

  return (
    <div className={classNames("settings-dialog__container", getColorClassName(activeMenuItem?.color))}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("ProfileSettings.Profile")}</h2>
      </header>
      <div className="profile-settings__container-wrapper">
        <div className="profile-settings__container">
          <SettingsInput
            data-clarity-mask="True"
            id="profileSettingsUserName"
            label={t("ProfileSettings.UserName")}
            value={userName}
            maxLength={64}
            onChange={(e) => setUserName(e.target.value)}
            submit={() => dispatch(editSelf({auth: {...self, name: userName}, applyOptimistically: true}))}
          />

          <AvatarSettings id={id} />
        </div>
      </div>
    </div>
  );
};
