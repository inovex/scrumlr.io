import React from "react";
import classNames from "classnames";
import "./Dropdown.scss";
import {DropdownItemButton, DropdownItemButtonProps} from "./DropdownItemButton";
import {DropdownMain} from "./DropdownMain";
import {DropdownFooter} from "./DropdownFooter";
import {DropdownItem} from "./DropdownItem";
import {DropdownProps} from "./DropdownProps";

type DropdownSubcomponents = {
  Main: React.FC<DropdownProps>;
  Footer: React.FC<DropdownProps>;
  Item: React.FC<DropdownProps>;
  ItemButton: React.FC<DropdownItemButtonProps>;
};

const Dropdown: React.FC<DropdownProps> & DropdownSubcomponents = ({className, children, ...other}) => (
  <menu className={classNames("dropdown", className)} {...other}>
    {children}
  </menu>
);

Dropdown.Main = DropdownMain;
Dropdown.Footer = DropdownFooter;
Dropdown.Item = DropdownItem;
Dropdown.ItemButton = DropdownItemButton;

export default Dropdown;
