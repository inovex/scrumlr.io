import {useState} from "react";
import classNames from "classnames";
import "./Switch.scss";

type SwitchDirection = "left" | "right";

export const Switch = () => {
  const [direction, setDirection] = useState<SwitchDirection>("left");

  const handleSwitch = (section: SwitchDirection) => {
    setDirection(section);
  };

  return (
    <div className="switch-container">
      <div className={classNames("switch-item", {"switch-item--active": direction === "left"})} onClick={() => handleSwitch("left")}>
        Templates
      </div>
      <div className={classNames("switch-item", {"switch-item--active": direction === "right"})} onClick={() => handleSwitch("right")}>
        Sessions
      </div>
    </div>
  );
};
