import classNames from "classnames";
import "./Switch.scss";

type SwitchDirection = "left" | "right";

type SwitchProps = {
  className?: string;
  leftText: string;
  rightText: string;
  activeDirection: SwitchDirection;
  disabled?: boolean;
  toggle?: () => void;
};

/*
 * Switch component supporting two states ("left" or "right").
 * it is completely stateless, which means the logic to actually flip the switch resides in the parent component.
 * the component itself only emits whenever the switch is interacted with.
 */
export const Switch = (props: SwitchProps) => (
    <button className={classNames("switch", props.className)} disabled={props.disabled} onClick={props.toggle}>
      <div className={classNames("switch__item", {"switch__item--active": props.activeDirection === "left"})}>{props.leftText}</div>
      <div className={classNames("switch__item", {"switch__item--active": props.activeDirection === "right"})}>{props.rightText}</div>
    </button>
  );
