import {useState} from "react";
import "./ToggleButton.scss";
import classNames from "classnames";

type ToggleButtonProps<T> = {
  className?: string;
  values: [T, T];
  defaultValue: T;
  onClick?: (value: T) => void;
  disabled?: boolean;
};

export const ToggleButton = <T,>(props: ToggleButtonProps<T>) => {
  const [value, setValue] = useState(props.defaultValue);
  const onClick = () => {
    const newValue = value === props.values[0] ? props.values[1] : props.values[0];
    props.onClick?.(newValue);
    setValue(newValue);
  };

  return (
    <button
      disabled={props.disabled}
      onClick={onClick}
      className={classNames("toggle-button", {"toggle-button--left": value === props.values[0]}, {"toggle-button--right": value === props.values[1]}, props.className)}
    />
  );
};
