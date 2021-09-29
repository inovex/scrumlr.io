import React from "react";
import classNames from "classnames";
import "./Dropdown.scss";

type DropdownProps = {
  className?: string;
};

type DropdownItemButtonProps = {
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type DropdownSubcomponents = {
  Main: React.FC<DropdownProps>;
  Footer: React.FC<DropdownProps>;
  Item: React.FC<DropdownProps>;
  ItemButton: React.FC<DropdownItemButtonProps>;
};

const Dropdown: React.FC<DropdownProps> & DropdownSubcomponents = (props) => <menu className={classNames("dropdown", props.className)}>{props.children}</menu>;

const DropdownMain: React.FC<DropdownProps> = (props) => (
  <main className={classNames("dropdown__main", props.className)}>
    <ul>{props.children}</ul>
  </main>
);
const DropdownFooter: React.FC<DropdownProps> = (props) => (
  <footer className={classNames("dropdown__footer", props.className)}>
    <ul>{props.children}</ul>
  </footer>
);
const DropdownItem: React.FC<DropdownProps> = (props) => <li className={classNames("dropdown__item", props.className)}>{props.children}</li>;
const DropdownItemButton: React.FC<DropdownItemButtonProps> = (props) => (
  <li className={classNames("dropdown__item-button", props.className)}>
    <button onClick={(e) => props.onClick?.(e)}>{props.children}</button>
  </li>
);

Dropdown.Main = DropdownMain;
Dropdown.Footer = DropdownFooter;
Dropdown.Item = DropdownItem;
Dropdown.ItemButton = DropdownItemButton;

export default Dropdown;
