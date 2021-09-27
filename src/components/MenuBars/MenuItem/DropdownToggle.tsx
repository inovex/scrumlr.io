import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import classNames from "classnames";
import "./MenuItem.scss";
import Dropdown from "./DropDown";

type DropdownToggleProps = {
  direction: "left" | "right";
  onToggle: (active: boolean) => void;
  toggleStartLabel: string;
  toggleStopLabel: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

function DropdownToggle(props: DropdownToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setStatus] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const Icon = props.icon;

  return (
    <button
      ref={buttonRef}
      disabled={props.disabled}
      className={classNames("menu-item", {"menu-item--active": isActive, "menu-item--disabled": !isActive}, `menu-item--${props.direction}`)}
      onClick={() => {
        props.onToggle(!isActive);
        setStatus((prevValue) => !prevValue);
        setShowDropdown((prevValue) => !prevValue);
      }}
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{isActive ? props.toggleStopLabel : props.toggleStartLabel}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" />
      <CloseIcon className="menu-item__icon menu-item__icon--end" />
      {buttonRef.current?.getBoundingClientRect() && (
        <Dropdown show={showDropdown} coords={{x: buttonRef.current.getBoundingClientRect().x - 245 - 20, y: buttonRef.current.getBoundingClientRect().y + 36}} />
      )}
    </button>
  );
}

export default DropdownToggle;
