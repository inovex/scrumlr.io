import classNames from "classnames";
import {TabIndex} from "constants/tabIndex";
import "./MenuItem.scss";

type MenuButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  tabIndex?: number;
};

export const MenuButton = (props: MenuButtonProps) => {
  const Icon = props.icon;

  return (
    <button
      disabled={props.disabled}
      className={classNames(`menu-item menu-item--${props.direction}`)}
      onClick={() => props.onClick()}
      tabIndex={props.tabIndex ?? TabIndex.default}
      aria-label={props.label}
    >
      <div className="menu-item__tooltip" aria-hidden>
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" aria-hidden />
    </button>
  );
};
