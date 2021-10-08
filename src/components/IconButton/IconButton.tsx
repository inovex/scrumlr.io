import React from "react";
import "./IconButton.scss";

type IconButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

export function IconButton(props: IconButtonProps) {
  const Icon = props.icon;

  return (
    <button className={`icon-button icon-button--${props.direction}`} onClick={props.onClick}>
      <div className="icon-button__tooltip">
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className="icon-button__icon icon-button__icon--start" />
    </button>
  );
}
