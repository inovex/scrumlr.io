import {useState} from "react";
import classNames from "classnames";
import "./Switch.scss";

export type SwitchDirection = "left" | "right";

type SwitchProps = {
  initialize?: () => SwitchDirection;
  leftText: string;
  rightText: string;
  onLeftSwitch: () => void;
  onRightSwitch: () => void;
};

export const Switch = (props: SwitchProps) => {
  const [direction, setDirection] = useState<SwitchDirection>(props.initialize?.() ?? "left");

  const handleSwitch = (direction: SwitchDirection) => {
    setDirection(direction);
    if (direction === "left") {
      props.onLeftSwitch();
    } else {
      props.onRightSwitch();
    }
  };

  return (
    <div className="switch">
      <div className={classNames("switch__item", {"switch__item--active": direction === "left"})} onClick={() => handleSwitch("left")}>
        {props.leftText}
      </div>
      <div className={classNames("switch__item", {"switch__item--active": direction === "right"})} onClick={() => handleSwitch("right")}>
        {props.rightText}
      </div>
    </div>
  );
};
