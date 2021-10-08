import React, {useEffect, useState} from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import classNames from "classnames";
import "./MenuItem.scss";

type MenuToggleProps = {
  direction: "left" | "right";
  onToggle: (active: boolean) => void;
  value?: boolean;
  toggleStartLabel: string;
  toggleStopLabel: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

export function MenuToggle(props: MenuToggleProps) {
  const [value, setValue] = useState(props.value ?? false);
  const [touchHover, setTouchHover] = useState(false);
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
      className={classNames("menu-item", {"menu-item--active": value, "menu-item--disabled": !value}, `menu-item--${props.direction}`, {
        "menu-item--touch-hover": touchHover,
      })}
      onClick={() => {
        if (document.getElementsByClassName("menu-item--touch-hover").length === 0) {
          onToggle();
        }
      }}
      onTouchEnd={(e) => {
        if (!touchHover && document.getElementsByClassName("menu-item--touch-hover").length === 0) {
          e.preventDefault();
          window.addEventListener("click", () => setTouchHover(false), {once: true});
          setTouchHover(true);
        }
        if (touchHover) {
          e.preventDefault();
          setTouchHover(false);
          onToggle();
        }
      }}
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{value ? props.toggleStopLabel : props.toggleStartLabel}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" />
      <CloseIcon className="menu-item__icon menu-item__icon--end" />
    </button>
  );
}
