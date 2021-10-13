import React from "react";
import classNames from "classnames";
import {DropdownProps} from "./DropdownProps";

export const DropdownFooter: React.FC<DropdownProps> = ({className, children, ...other}) => (
  <div className={classNames("dropdown__footer", className)} {...other}>
    <ul>{children}</ul>
  </div>
);
