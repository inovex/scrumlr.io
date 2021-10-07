import React, {useEffect, useState} from "react";
import classNames from "classnames";
import "./MenuItem.scss";
import "./DropdownButton.scss";

type DropdownButtonProps = {
  direction: "left" | "right";
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

export const DropdownButton: React.FC<DropdownButtonProps> = (props) => {
  const [touchHover, setTouchHover] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const Icon = props.icon;

  useEffect(() => {
    if (showDropdown) {
      window.addEventListener("click", () => setShowDropdown(false), {once: true});
    }
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
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" />

      {props.children}
    </button>
  );
};
