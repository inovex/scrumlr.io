import {FC} from "react";
import {Toggle} from "components/Toggle";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {SettingsButton} from "./SettingsButton";

export const NotificationSettings: FC = () => {
  const {t} = useTranslation();
  const hotkeyNotificationsEnabled = useAppSelector((state) => state.view.hotkeyNotificationsEnabled);

  return (
    <section>
      <SettingsButton
        aria-checked={hotkeyNotificationsEnabled}
        label={t("Appearance.showHotkeyNotifications")}
        onClick={() => (hotkeyNotificationsEnabled ? store.dispatch(Actions.disableHotkeyNotifications()) : store.dispatch(Actions.enableHotkeyNotifications()))}
        role="switch"
      >
        <Toggle active={hotkeyNotificationsEnabled} />
      </SettingsButton>
    </section>
  );
};
