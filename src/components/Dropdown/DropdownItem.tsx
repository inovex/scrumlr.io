import React from "react";
import classNames from "classnames";
import {DropdownProps} from "./DropdownProps";

export const DropdownItem: React.FC<DropdownProps> = ({className, children, ...other}) => (
  <li className={classNames("dropdown__item", className)} {...other}>
    {children}
  </li>
);
