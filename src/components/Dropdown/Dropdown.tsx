import {ReactNode, useState} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import "./Dropdown.scss";

type DropdownOption = {
  key: string;
  label: string;
  icon: ReactNode;
};

type DropdownProps = {
  options: DropdownOption[];
  activeKey: string;
  onSelect?: (id: string) => void;
};

export const Dropdown = (props: DropdownProps) => {
  const [open, setOpen] = useState(false);

  const activeOption = props.options.find((option) => option.key === props.activeKey) ?? props.options[0];

  const toggleMenu = () => {
    setOpen((curr) => !curr);
  };

  return (
    <div className={classNames("dropdown", {"dropdown--open": open})}>
      <div className={classNames("dropdown__option", "dropdown__option--active")} key={activeOption.key} role="button" onClick={toggleMenu}>
        <div className="dropdown__option-icon">{activeOption.icon}</div>
        <div className="dropdown__option-label">{activeOption.label}</div>
        <div className={classNames("dropdown__option-arrow", {"dropdown__option-arrow--up": open, "dropdown__option-arrow--down": !open})}>
          <ArrowIcon />
        </div>
      </div>
      {open &&
        props.options
          .filter((option) => option.key !== props.activeKey)
          .map((option) => (
            <div className={classNames("dropdown__option")} key={option.key} role="button">
              <div className="dropdown__option-icon">{option.icon}</div>
              <div className="dropdown__option-label">{option.label}</div>
            </div>
          ))}
    </div>
  );
};
