import classNames from "classnames";
import "./SettingsToggle.scss";

type SettingsToggleProps = {
  active: boolean | undefined;
};

export const SettingsToggle = ({active}: SettingsToggleProps) => (
  <div className="settings-toggle">
    <div className={classNames("settings-toggle__switch", {"settings-toggle__switch--left": !active}, {"settings-toggle__switch--right": active})} />
  </div>
);
