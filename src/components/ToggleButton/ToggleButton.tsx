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
export const ToggleButton = <T extends unknown>({className, values, value, onToggle, disabled, onLeft, onRight}: ToggleButtonProps<T>) => {
  const onClick = () => {
    if (disabled) return;
    const newValue = value === values[0] ? values[1] : values[0];
    onToggle?.(newValue);
    if (newValue === values[0]) {
      onLeft?.();
    } else {
      onRight?.();
    }
  };

  const isActive = value === values[1];

  return (
    // aria-disabled instead of disabled so that it is focusable but not editable
    <button aria-disabled={disabled} onClick={onClick} className={classNames("toggle-button", className)} aria-pressed={isActive}>
      <Toggle active={isActive} disabled={disabled} />
    </button>
  );
};
