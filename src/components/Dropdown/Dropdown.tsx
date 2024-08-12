import {ReactNode} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import "./Dropdown.scss";

type DropdownOption = {
  key: string;
  label: string;
  icon: ReactNode;
};

type DropdownProps = {
  open: boolean;
  options: DropdownOption[];
  activeKey: string;

  onToggleMenu: () => void;
  onSelect: (id: string) => void;
};

export const Dropdown = (props: DropdownProps) => {
  const activeOption = props.options.find((option) => option.key === props.activeKey) ?? props.options[0];

  // active refers to the option on the very top
  const renderDropdownOption = (option: DropdownOption, active: boolean) => (
    <div
      className={classNames("dropdown__option", "dropdown__option--active")}
      key={option.key}
      role="button"
      onClick={active ? props.onToggleMenu : () => props.onSelect(option.key)}
    >
      <div className="dropdown__option-icon">{option.icon}</div>
      <div className="dropdown__option-label">{option.label}</div>
      {active ? (
        <div
          className={classNames("dropdown__option-arrow", {
            "dropdown__option-arrow--up": props.open,
            "dropdown__option-arrow--down": !props.open,
          })}
        >
          <ArrowIcon />
        </div>
      ) : (
        <div className="dropdown__option-arrow-placeholder" />
      )}
    </div>
  );

  return (
    <div className={classNames("dropdown", {"dropdown--open": props.open})}>
      {renderDropdownOption(activeOption, true)}
      {props.open && props.options.filter((option) => option.key !== props.activeKey).map((option) => renderDropdownOption(option, false))}
    </div>
  );
};
