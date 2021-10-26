import React from "react";
import classNames from "classnames";
import {DropdownProps} from "./DropdownProps";

export const DropdownMain: React.FC<DropdownProps> = ({className, children, ...other}) => (
  <div className={classNames("dropdown__main", className)} {...other}>
    <ul>{children}</ul>
  </div>
);
