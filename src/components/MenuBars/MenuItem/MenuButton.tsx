import classNames from "classnames";
import {useEffect, useState} from "react";
import "./MenuItem.scss";

type MenuButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

function MenuButton(props: MenuButtonProps) {
  const [clickCount, setClickCount] = useState(0);
  const Icon = props.icon;

  useEffect(() => {
    if (clickCount > 0) {
      window.addEventListener("click", () => setClickCount(0), {once: true});
    }
    if (clickCount === 2) {
      props.onClick();
      setClickCount(0);
    }
  }, [clickCount]);

  return (
    <button
      disabled={props.disabled}
      className={classNames(`menu-item menu-item--${props.direction}`, {"menu-item--touch-hover": clickCount === 1})}
      onClick={() => props.onClick()}
      onTouchEnd={(e) => {
        e.preventDefault();
        setClickCount((prev) => ++prev % 3);
      }}
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{props.label}</span>
      </div>
      <Icon className="menu-item__icon menu-item__icon--start" />
    </button>
  );
}

export default MenuButton;
