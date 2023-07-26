import {FC} from "react";
import {Toggle} from "components/Toggle";
import store, {useAppSelector} from "store";
import {ReactComponent as InfoIcon} from "assets/icon-info.svg";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {SettingsButton} from "./SettingsButton";

export const HotkeySettings: FC = () => {
  const {t} = useTranslation();
  const hotkeysEnabled = useAppSelector((state) => state.view.hotkeysAreActive);

  return (
    <section>
      <SettingsButton aria-checked={hotkeysEnabled} label={t("Hotkeys.hotkeyToggle")} onClick={() => store.dispatch(Actions.setHotkeyState(!hotkeysEnabled))} role="switch">
        <Toggle active={hotkeysEnabled} />
      </SettingsButton>
      <a className="profile-settings__open-cheat-sheet-button" href={`${process.env.PUBLIC_URL}/hotkeys.pdf`} target="_blank" rel="noopener noreferrer">
        <p>{t("Hotkeys.cheatSheet")}</p>
        <InfoIcon />
      </a>
    </section>
  );
};
