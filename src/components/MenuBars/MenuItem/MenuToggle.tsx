import React, {useEffect, useState} from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import classNames from "classnames";
import "./MenuItem.scss";
import {TabIndex} from "constants/tabIndex";

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
  const Icon = props.icon;

  useEffect(() => {
    setValue(props.value!);
  }, [props.value]);

  const onToggle = () => {
    props.onToggle?.(!value);
    setValue((currVal) => !currVal);
  };

  return (
    <button
      disabled={props.disabled}
      className={classNames("menu-item", {"menu-item--active": value, "menu-item--disabled": !value}, `menu-item--${props.direction}`)}
      onClick={() => {
        onToggle();
      }}
      tabIndex={props.tabIndex ?? TabIndex.default}
      aria-label={value ? props.toggleStopLabel : props.toggleStartLabel}
    >
      <div className="menu-item__tooltip" aria-hidden>
        <span className="tooltip__text">{value ? props.toggleStopLabel : props.toggleStartLabel}</span>
      </div>
      <Icon className="menu-item__icon" aria-hidden />
      <CloseIcon className="menu-item__icon" aria-hidden />
    </button>
  );
};
