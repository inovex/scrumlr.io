import classNames from "classnames";
import "./Switch.scss";

type SwitchDirection = "left" | "right";

type SwitchProps = {
  className?: string;
  activeDirection: SwitchDirection;
  leftText: string;
  rightText: string;
  onLeftSwitch?: () => void;
  onRightSwitch?: () => void;
};

/*
 * Switch component supporting two states ("left" or "right").
 * it is completely stateless, which means the logic to actually flip the switch resides in the parent component.
 * the component itself only emits whenever the switch is interacted with.
 */
export const Switch = (props: SwitchProps) => {
  const handleSwitch = (direction: SwitchDirection) => {
    if (direction === "left") {
      props.onLeftSwitch?.();
    } else {
      props.onRightSwitch?.();
    }
  };

  return (
    <div className={classNames("switch", props.className)}>
      <div className={classNames("switch__item", {"switch__item--active": props.activeDirection === "left"})} onClick={() => handleSwitch("left")}>
        {props.leftText}
      </div>
      <div className={classNames("switch__item", {"switch__item--active": props.activeDirection === "right"})} onClick={() => handleSwitch("right")}>
        {props.rightText}
      </div>
    </div>
  );
};
