import {ReactNode} from "react";
import "./Dropdown.scss";

type DropdownOption = {
  icon: ReactNode;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  activeIndex: number;
  onSelect?: (index: number) => void;
};

export const Dropdown = (props: DropdownProps) => <div>Hello Dropdown</div>;
