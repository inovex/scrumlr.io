import React, {useEffect, useState} from "react";
import "./MenuItem.scss";
import {TooltipButton} from "components/TooltipButton/TooltipButton";

type MenuToggleProps = {
  direction: "left" | "right";
  onToggle: (active: boolean) => void;
  value?: boolean;
  toggleStartLabel: string;
  toggleStopLabel: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  tabIndex?: number;
};

export const MenuToggle = (props: MenuToggleProps) => {
  const [value, setValue] = useState(props.value ?? false);

  useEffect(() => {
    setValue(props.value!);
  }, [props.value]);

  const onToggle = () => {
    props.onToggle?.(!value);
    setValue((currVal) => !currVal);
  };

  return (
    <TooltipButton
      direction={props.direction}
      onClick={onToggle}
      label={value ? props.toggleStopLabel : props.toggleStartLabel}
      disabled={props.disabled}
      tabIndex={props.tabIndex}
      icon={props.icon}
      active={value}
    />
  );
};
