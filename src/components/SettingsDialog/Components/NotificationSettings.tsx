import {FC} from "react";
import {Toggle} from "components/Toggle";
import {useLocalStorage} from "utils/hooks/useLocalStorage";
import {SettingsButton} from "./SettingsButton";

export const NotificationSettings: FC = () => {
  const [hotkeyNotificationsEnabled, setHotkeyNotificationsEnabled] = useLocalStorage("hotkeyNotificationsEnabled", true);

  return (
    <section>
      <SettingsButton label="Show hotkey notifications" onClick={() => setHotkeyNotificationsEnabled(!hotkeyNotificationsEnabled)}>
        <Toggle active={hotkeyNotificationsEnabled} />
      </SettingsButton>
    </section>
  );
};
