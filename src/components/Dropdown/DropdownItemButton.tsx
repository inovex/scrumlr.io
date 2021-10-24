import React from "react";
import classNames from "classnames";
import {DropdownProps} from "./DropdownProps";

export type DropdownItemButtonProps = DropdownProps & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLButtonElement>) => void;
};

export const DropdownItemButton: React.FC<DropdownItemButtonProps> = ({className, children, onClick, onTouchEnd, ...other}) => (
  <li className={classNames("dropdown__item-button", className)} {...other}>
    <button onClick={onClick} onTouchEnd={onTouchEnd}>
      {children}
    </button>
  </li>
);
