import classNames from "classnames";
import "./Toggle.scss";
import {FC} from "react";

type ToggleProps = {
  /**
   * Additional CSS classes.
   */
  className?: string;

  /**
   * Disable the toggle.
   */
  disabled?: boolean;

  active: boolean;
};

export const Toggle: FC<ToggleProps> = ({className, disabled, active}) => (
  <div className={classNames("toggle", {"toggle--active": active, "toggle--disabled": disabled}, className)} />
);
