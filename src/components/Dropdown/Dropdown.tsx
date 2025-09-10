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
  className?: string;
  open: boolean;
  options: DropdownOption<K>[];
  activeKey: K;

  onToggleMenu: () => void;
  onSelect: (key: K) => void;
};

export const Dropdown = <K = string,>(props: DropdownProps<K>) => {
  if (props.options.length === 0) return null;
  const activeOption = props.options.find((option) => option.key === props.activeKey) ?? props.options[0];

  // active refers to the option on the very top
  // TODO focus lock (maybe the same way as with note reactions) update: do this with #4917
  const renderDropdownOption = (option: DropdownOption<K>, active: boolean) => (
    <div
      className={classNames("dropdown__option", {"dropdown__option--active": active})}
      key={String(option.key)}
      role="button"
      tabIndex={0} // TODO check sonarQ when we use this
      onClick={active ? props.onToggleMenu : () => props.onSelect(option.key)}
    >
      <div className="dropdown__option-icon">{option.icon}</div>
      <div className="dropdown__option-label">{option.label}</div>
      {active && (
        <div
          className={classNames("dropdown__option-arrow", {
            "dropdown__option-arrow--up": props.open,
            "dropdown__option-arrow--down": !props.open,
          })}
        >
          <ArrowIcon />
        </div>
      )}
    </div>
  );

  return (
    <div className={classNames(props.className, "dropdown", {"dropdown--open": props.open})} role="combobox" aria-controls="dropdown-list" aria-expanded={props.open} tabIndex={0}>
      {renderDropdownOption(activeOption, true)}
      {props.open && (
        <div className="dropdown__options-container">{props.options.filter((option) => option.key !== props.activeKey).map((option) => renderDropdownOption(option, false))}</div>
      )}
    </div>
  );
};
