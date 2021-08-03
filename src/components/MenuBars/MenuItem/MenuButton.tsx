import React from "react";
import "./MenuItem.scss";

type MenuButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

function MenuButton(props: MenuButtonProps) {
  const Icon = props.icon;

  return (
    <button className={`menu-item menu-item--${props.direction}`} onClick={props.onClick}>
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" />
    </button>
  );
}

export default MenuButton;
