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
        <div className="dropdown__button-icon">{activeOption.icon}</div>
        <div className="dropdown__button-label">{activeOption.label}</div>
        <div className="dropdown__button-arrow">
          <ArrowIcon />
        </div>
      </div>
      {open && (
        <div className="dropdown__options">
          {props.options
            .filter((_, index) => index !== props.activeIndex)
            .map((option) => (
              <div className={classNames("dropdown__option")} role="button">
                <div className="dropdown__button-icon">{option.icon}</div>
                <div className="dropdown__button-label">{option.label}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
