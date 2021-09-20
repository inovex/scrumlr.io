import classNames from "classnames";
import "./ToggleButton.scss";

type ToggleButtonProps<T> = {
  className?: string;
  values: [T, T];
  value: T;
  onClick?: (value: T) => void;
  disabled?: boolean;
};

export const ToggleButton = <T,>(props: ToggleButtonProps<T>) => {
  const onClick = () => {
    const newValue = props.value === props.values[0] ? props.values[1] : props.values[0];
    props.onClick?.(newValue);
  };

  return (
    <button
      disabled={props.disabled}
      onClick={onClick}
      className={classNames("toggle-button", {"toggle-button--left": props.value === props.values[0]}, {"toggle-button--right": props.value === props.values[1]}, props.className)}
    />
  );
};
