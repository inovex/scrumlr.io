import React from "react";
import classNames from "classnames";
import "./Dropdown.scss";

type DropdownProps = {
  className?: string;
};

type DropdownSubcomponents = {
  Main: React.FC;
  Footer: React.FC;
  Item: React.FC;
  ItemButton: React.FC<{onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void}>;
};

const Dropdown: React.FC<DropdownProps> & DropdownSubcomponents = (props) => <menu className={classNames("dropdown", props.className)}>{props.children}</menu>;

const DropdownMain: React.FC = (props) => (
  <main className="dropdown__main">
    <ul>{props.children}</ul>
  </main>
);
const DropdownFooter: React.FC = (props) => (
  <footer className="dropdown__footer">
    <ul>{props.children}</ul>
  </footer>
);
const DropdownItem: React.FC = (props) => <li className="dropdown__item">{props.children}</li>;
const DropdownItemButton: React.FC<{onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void}> = (props) => (
  <li className="dropdown__item-button">
    <button onClick={(e) => props.onClick?.(e)}>{props.children}</button>
  </li>
);

Dropdown.Main = DropdownMain;
Dropdown.Footer = DropdownFooter;
Dropdown.Item = DropdownItem;
Dropdown.ItemButton = DropdownItemButton;

export default Dropdown;
