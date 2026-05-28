import {ReactNode, useId, MouseEvent} from "react";
import classNames from "classnames";
import FocusLock, {AutoFocusInside} from "react-focus-lock";
import {Tooltip} from "components/Tooltip";
import {useOnBlur} from "utils/hooks/useOnBlur";
import "./MiniMenu.scss";

export type MiniMenuItem = {
  className?: string;
  element: ReactNode; // an Icon in most cases, but can also be a complex element (e.g. ColorPicker)
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

type MiniMenuProps = {
  className?: string;
  focusBehaviour?: "trap" | "moveFocus";
  items: MiniMenuItem[];
  onBlur?: () => void;

  small?: boolean; // smaller icons
  wrapToColumn?: boolean; // render as column in small screen sizes
  transparent?: boolean; // no background

  dataCy?: string;
};

export const MiniMenu = ({className, focusBehaviour, items, onBlur, small, wrapToColumn, transparent, dataCy}: MiniMenuProps) => {
  const baseId = useId();
  const onClickItem = (e: MouseEvent, item: MiniMenuItem) => {
    e.preventDefault(); // fix some issues
    item.onClick?.();
  };

  const menuRef = useOnBlur<HTMLDivElement>(() => {
    onBlur?.();
  });

  const renderMenu = () => (
    <div
      ref={menuRef}
      className={classNames(className, "mini-menu", {"mini-menu--small": small, "mini-menu--transparent": transparent, "mini-menu--wrap-to-column": wrapToColumn})}
      data-cy={dataCy}
    >
      {items.map((item, index) => {
        const anchor = `mini-menu-${item.label}-${baseId}-${index}`;
        const isLastItem = index === items.length - 1;
        return (
          <button
            aria-label={item.label}
            id={anchor}
            className={classNames(item.className, "mini-menu__item", {
              "mini-menu__item--active": item.active,
              "mini-menu__item--small": small,
              "mini-menu__item--disabled": item.disabled,
            })}
            key={item.label}
            onClick={(e) => onClickItem(e, item)}
            disabled={item.disabled}
            data-cy={`${dataCy}-item-${item.label}`}
            data-testid={`${dataCy}-item-${item.label}`}
            data-autofocus={isLastItem}
          >
            {item.element}
            <Tooltip anchorId={anchor} color="backlog-blue">
              {item.label}
            </Tooltip>
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
      return <AutoFocusInside>{renderMenu()}</AutoFocusInside>;
    default:
      return <>{renderMenu()}</>;
  }
};
