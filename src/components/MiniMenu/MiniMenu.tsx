import {ReactNode, useEffect, useRef} from "react";
import classNames from "classnames";
import {uniqueId} from "underscore";
import "./MiniMenu.scss";

type MiniMenuItem = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type MiniMenuProps = {
  className?: string;
  items: MiniMenuItem[];
};

export const MiniMenu = ({className, items}: MiniMenuProps) => {
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  return (
    <div className={classNames(className, "mini-menu")}>
      {items.map((item, index) => {
        const anchor = uniqueId(`mini-menu-${item.label}`);
        return (
          <button
            ref={index === 0 ? firstButtonRef : null}
            data-tooltip-id="scrumlr-tooltip"
            data-tooltip-content={item.label}
            aria-label={item.label}
            id={anchor}
            className={classNames("mini-menu__item", {"mini-menu__item--active": item.active})}
            key={item.label}
            onClick={item?.onClick}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
};
