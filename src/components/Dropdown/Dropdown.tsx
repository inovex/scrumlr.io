import {ReactNode} from "react";
import classNames from "classnames";
import {ReactComponent as ArrowIcon} from "assets/icons/arrow-down.svg";
import "./Dropdown.scss";

type DropdownOption<K = string> = {
  key: K;
  label: string;
  icon: ReactNode;
};

type DropdownProps<K = string> = {
  open: boolean;
  options: DropdownOption<K>[];
  activeKey: K;

  onToggleMenu: () => void;
  onSelect: (key: K) => void;
};

export const Dropdown = <K = string,>(props: DropdownProps<K>) => {
  const activeOption = props.options.find((option) => option.key === props.activeKey) ?? props.options[0];

  // active refers to the option on the very top
  // TODO focus lock (maybe the same way as with note reactions)
  const renderDropdownOption = (option: DropdownOption<K>, active: boolean) => (
    <div
      className={classNames("dropdown__option", "dropdown__option--active")}
      key={String(option.key)}
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
    <div className={classNames("dropdown", {"dropdown--open": props.open})} role="combobox" aria-controls="dropdown-list" aria-expanded={props.open} tabIndex={0}>
      {renderDropdownOption(activeOption, true)}
      {props.open && props.options.filter((option) => option.key !== props.activeKey).map((option) => renderDropdownOption(option, false))}
    </div>
  );
};
