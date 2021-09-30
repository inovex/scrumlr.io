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

function MenuToggle(props: MenuToggleProps) {
  const [value, setValue] = useState(props.value ?? false);
  const [clickCount, setClickCount] = useState(0);
  const Icon = props.icon;

  useEffect(() => {
    setValue(props.value!);
  }, [props.value]);

  useEffect(() => {
    if (clickCount > 0) {
      window.addEventListener("click", () => setClickCount(0), {once: true});
    }
    if (clickCount === 2) {
      props.onToggle(!value);
      setValue((val) => !val);
      setClickCount(0);
    }
  }, [clickCount]);

  return (
    <button
      disabled={props.disabled}
      className={classNames("menu-item", {"menu-item--active": value, "menu-item--disabled": !value}, `menu-item--${props.direction}`, {
        "menu-item--touch-hover": clickCount === 1,
      })}
      onClick={() => {
        props.onToggle(!value);
        setValue((val) => !val);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        setClickCount((prev) => ++prev % 3);
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

export default MenuToggle;
