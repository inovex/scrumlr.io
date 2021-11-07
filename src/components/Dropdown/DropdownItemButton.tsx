import React from "react";
import classNames from "classnames";
import {TabIndex} from "constants/tabIndex";
import {DropdownProps} from "./DropdownProps";

export type DropdownItemButtonProps = DropdownProps & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLButtonElement>) => void;
};

export const DropdownItemButton: React.FC<DropdownItemButtonProps> = ({className, tabIndex, children, onClick, onTouchEnd, ...other}) => (
  <li className={classNames("dropdown__item-button", className)} {...other}>
    <button tabIndex={tabIndex ?? TabIndex.disabled} onClick={onClick} onTouchEnd={onTouchEnd}>
      {children}
    </button>
  </li>
);
