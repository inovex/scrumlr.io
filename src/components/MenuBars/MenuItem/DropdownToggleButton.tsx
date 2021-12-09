import React, {useEffect, useState} from "react";
import classNames from "classnames";
import "./MenuItem.scss";
import "./DropdownToggleButton.scss";
import {TabIndex} from "constants/tabIndex";

type DropdownButtonProps = {
  direction: "left" | "right";
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  setTabable: React.Dispatch<React.SetStateAction<boolean>>;
  tabIndex?: number;
  active?: boolean;
};

export const DropdownToggleButton: React.FC<DropdownButtonProps> = (props) => {
  const [touchHover, setTouchHover] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const Icon = props.icon;

  useEffect(() => {
    if (showDropdown) {
      window.addEventListener("click", () => setShowDropdown(false), {once: true});
    }
    props.setTabable(showDropdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDropdown]);

  return (
    <button
      className={classNames("menu-item", `menu-item--${props.direction}`, {"dropdown-item--open": showDropdown}, {"menu-item--touch-hover": touchHover})}
      onClick={() => {
        setShowDropdown((prev) => !prev);
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
          setShowDropdown(true);
        }
      }}
      tabIndex={props.tabIndex ?? TabIndex.default}
      disabled={props.disabled}
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className={classNames("menu-item__icon", "menu-item__icon--start", {"menu-item-active": props.active})} />
      {props.children}
    </button>
  );
};
