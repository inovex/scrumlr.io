import {FC} from "react";
import {Toggle} from "components/Toggle";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {disableSnowfall, enableSnowfall} from "store/features";
import {SettingsButton} from "./SettingsButton";

export const SnowfallSettings: FC = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const snowfallEnabled = useAppSelector((state) => state.view.snowfallEnabled);

  return (
    <section>
      <SettingsButton
        aria-checked={snowfallEnabled}
        label={t("Appearance.showSnowfall")}
        onClick={() => (snowfallEnabled ? dispatch(disableSnowfall()) : dispatch(enableSnowfall()))}
        role="switch"
      >
        <Toggle active={snowfallEnabled} />
      </SettingsButton>
    </section>
  );
};
