import {ReactNode, useState} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
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

export const Dropdown = (props: DropdownProps) => {
  const [open, setOpen] = useState(false);

  const activeOption = props.options.find((_, index) => index === props.activeIndex) ?? props.options[0];

  const toggleMenu = () => {
    setOpen((curr) => !curr);
  };

  return (
    <div className={classNames("dropdown", {"dropdown--open": open})}>
      <div className={classNames("dropdown__button", "dropdown__option")} role="button" onClick={toggleMenu}>
        <div className="dropdown__option-icon">{activeOption.icon}</div>
        <div className="dropdown__option-label">{activeOption.label}</div>
        <div className={classNames("dropdown__option-arrow", {"dropdown__option-arrow--up": open, "dropdown__option-arrow--down": !open})}>
          <ArrowIcon />
        </div>
      </div>
      {open &&
        props.options
          .filter((_, index) => index !== props.activeIndex)
          .map((option) => (
            <div className={classNames("dropdown__option")} role="button">
              <div className="dropdown__option-icon">{option.icon}</div>
              <div className="dropdown__option-label">{option.label}</div>
            </div>
          ))}
    </div>
  );
};
