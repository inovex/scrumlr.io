import classNames from "classnames";
import "./Toggle.scss";

type ToggleProps<T> = {
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

export var Toggle = function<T,>(props: ToggleProps<T>) {
  return <div className={classNames("toggle", {"toggle--active": props.active, "toggle--disabled": props.disabled}, props.className)} />;
}
