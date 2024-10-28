import {ReactNode} from "react";
import classNames from "classnames";
import {uniqueId} from "underscore";
import "./MiniMenu.scss";
import ReactFocusLock from "react-focus-lock";

export type MiniMenuItem = {
  element: ReactNode; // an Icon in most cases, but can also be a complex element (e.g. ColorPicker)
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type MiniMenuProps = {
  className?: string;
  items: MiniMenuItem[];
};

export const MiniMenu = ({className, items}: MiniMenuProps) => (
  <ReactFocusLock autoFocus={false}>
    <div className={classNames(className, "mini-menu")}>
      {items.map((item) => {
        const anchor = uniqueId(`mini-menu-${item.label}`);
        return (
          <button
            data-tooltip-id="scrumlr-tooltip"
            data-tooltip-content={item.label}
            aria-label={item.label}
            id={anchor}
            className={classNames("mini-menu__item", {"mini-menu__item--active": item.active})}
            key={item.label}
            onClick={item?.onClick}
          >
            {item.element}
          </button>
        );
      })}
    </div>
  </ReactFocusLock>
);
