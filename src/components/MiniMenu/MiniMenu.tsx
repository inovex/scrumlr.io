import {ReactNode} from "react";
import classNames from "classnames";
import {Tooltip} from "components/Tooltip";
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

export const MiniMenu = (props: MiniMenuProps) => (
    <div className={classNames(props.className, "mini-menu")}>
      {props.items.map((item) => {
        const anchor = uniqueId(`mini-menu-${item.label}`);
        return (
          <>
            <button id={anchor} className={classNames("mini-menu__item", {"mini-menu__item--active": item.active})} key={item.label} onClick={item?.onClick}>
              {item.icon}
            </button>
            <Tooltip anchorSelect={`#${anchor}`} content={item.label} color="backlog-blue" />
          </>
        );
      })}
    </div>
  );
