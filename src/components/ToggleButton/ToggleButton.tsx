import classNames from "classnames";
import "./ToggleButton.scss";
import {Toggle} from "../Toggle";

type ToggleButtonProps<T> = {
  /**
   * Additional CSS classes.
   */
  className?: string;
  /**
   * The values between which is toggled.
   * If the current value of the toggle equals the first value, the toggle will be on the left.
   * If the current value of the toggle equals the second value, the toggle will be on the right.
   */
  values: [T, T];
  /**
   * Current value of the toggle.
   */
  value: T;
  /**
   * Triggered when the toggle changes.
   * The callback will return the new value of the toggle.
   */
  onToggle?: (value: T) => void;
  /**
   * Disable the toggle.
   */
  disabled?: boolean;
  /**
   * Triggered if the toggle changes to the left.
   */
  onLeft?: () => void;
  /**
   * Triggered if the toggle changes to the right.
   */
  onRight?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const ToggleButton = <T extends unknown>(props: ToggleButtonProps<T>) => {
  const onClick = () => {
    if (props.disabled) return;
    const newValue = props.value === props.values[0] ? props.values[1] : props.values[0];
    props.onToggle?.(newValue);
    if (newValue === props.values[0]) {
      props.onLeft?.();
    } else {
      props.onRight?.();
    }
  };

  const isActive = props.value === props.values[1];

  return (
    // aria-disabled instead of disabled so that it is focusable but not editable
    <button aria-disabled={props.disabled} onClick={onClick} className={classNames("toggle-button", props.className)} aria-pressed={isActive}>
      <Toggle active={isActive} disabled={props.disabled} />
    </button>
  );
};
