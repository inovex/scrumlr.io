import {FC} from "react";
import {Toggle} from "components/Toggle";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {disableHotkeyNotifications, enableHotkeyNotifications} from "store/features";
import {SettingsButton} from "./SettingsButton";

export const NotificationSettings: FC = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const hotkeyNotificationsEnabled = useAppSelector((state) => state.view.hotkeyNotificationsEnabled);

  return (
    <section>
      <SettingsButton
        aria-checked={hotkeyNotificationsEnabled}
        label={t("Appearance.showHotkeyNotifications")}
        onClick={() => (hotkeyNotificationsEnabled ? dispatch(disableHotkeyNotifications()) : dispatch(enableHotkeyNotifications()))}
        role="switch"
      >
        <Toggle active={hotkeyNotificationsEnabled} />
      </SettingsButton>
    </section>
  );
};
