import React, {useState} from "react";
import classNames from "classnames";
import "../MenuItem/MenuItem.scss";

type DropdownButtonProps = {
  direction: "left" | "right";
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

export const DropdownButton: React.FC<DropdownButtonProps> = (props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const Icon = props.icon;

  return (
    <div
      className={classNames("menu-item", `menu-item--${props.direction}`, {"dropdown-item--open": showDropdown})}
      onClick={() => {
        setShowDropdown((prev) => !prev);
      }}
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" />

      {props.children}
    </div>
  );
};
