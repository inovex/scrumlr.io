import {FC} from "react";
import {Toggle} from "components/Toggle";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {SettingsButton} from "./SettingsButton";

export const NotificationSettings: FC = () => {
  const hotkeyNotificationsEnabled = useAppSelector((state) => state.view.hotkeyNotificationsEnabled);

  return (
    <section>
      <SettingsButton
        label="Show hotkey notifications"
        onClick={() => (hotkeyNotificationsEnabled ? store.dispatch(Actions.disableHotkeyNotifications()) : store.dispatch(Actions.enableHotkeyNotifications()))}
      >
        <Toggle active={hotkeyNotificationsEnabled} />
      </SettingsButton>
    </section>
  );
};
