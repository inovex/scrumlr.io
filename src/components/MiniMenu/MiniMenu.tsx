import React, {ReactNode} from "react";
import classNames from "classnames";
import {uniqueId} from "underscore";
import FocusLock, {MoveFocusInside} from "react-focus-lock";
import "./MiniMenu.scss";

export type MiniMenuItem = {
  element: ReactNode; // an Icon in most cases, but can also be a complex element (e.g. ColorPicker)
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type MiniMenuProps = {
  className?: string;
  focusBehaviour?: "trap" | "moveFocus";
  items: MiniMenuItem[];
  onBlur?: () => void;
};

export const MiniMenu = ({className, focusBehaviour, items, onBlur}: MiniMenuProps) => {
  const onClickItem = (e: React.MouseEvent, item: MiniMenuItem) => {
    e.preventDefault(); // fix some issues
    item.onClick?.();
  };

  const renderMenu = () => (
    <div className={classNames(className, "mini-menu")} onBlur={onBlur}>
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
            // mouse down instead of click because it has precedence over blur
            onMouseDown={(e) => onClickItem(e, item)}
          >
            {item.element}
          </button>
        );
      })}
    </div>
  );

  // depending on use case we want to trap the focus or not
  // trapping means we cannot interact with other component till menu is closed,
  // and also the focus will return to the beginning instead of going to the next component
  switch (focusBehaviour) {
    case "trap":
      return <FocusLock autoFocus>{renderMenu()}</FocusLock>;
    case "moveFocus":
      return <MoveFocusInside>{renderMenu()}</MoveFocusInside>;
    default:
      return <>{renderMenu()}</>;
  }
};
