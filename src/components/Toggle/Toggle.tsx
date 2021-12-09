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

export const Toggle: FC<ToggleProps> = (props) => <div className={classNames("toggle", {"toggle--active": props.active, "toggle--disabled": props.disabled}, props.className)} />;
