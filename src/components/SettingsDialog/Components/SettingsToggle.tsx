import {VFC} from "react";
import classNames from "classnames";
import "./SettingsToggle.scss";

export interface SettingsToggleProps {
  active: boolean | undefined;
}

export const SettingsToggle: VFC<SettingsToggleProps> = ({active}) => (
  <div className="settings-toggle">
    <div className={classNames("settings-toggle__switch", {"settings-toggle__switch--left": !active}, {"settings-toggle__switch--right": active})} />
  </div>
);
