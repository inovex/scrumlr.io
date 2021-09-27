import React from "react";
import classNames from "classnames";
import "./Dropdown.scss";

type DropdownProps = {
  className?: string;
};

const Dropdown: React.FC<DropdownProps> & {Main: React.FC; Footer: React.FC; Item: React.FC} = (props) => <menu className={classNames("dropdown", props.className)}>{props.children}</menu>;

const DropdownMain: React.FC = (props) => (
    <main>
      <ul>{props.children}</ul>
    </main>
  );
const DropdownFooter: React.FC = (props) => (
    <footer>
      <ul>{props.children}</ul>
    </footer>
  );
const DropdownItem: React.FC = (props) => <li>{props.children}</li>;

Dropdown.Main = DropdownMain;
Dropdown.Footer = DropdownFooter;
Dropdown.Item = DropdownItem;

export default Dropdown;
