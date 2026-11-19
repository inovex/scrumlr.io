import {ReactNode, useEffect, useId, useRef} from "react";
import classNames from "classnames";
import ArrowIcon from "assets/icons/arrow-down.svg?react";
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
  const activeOption = props.options.find((option) => option.key === props.activeKey) ?? props.options[0];
  const dropdownId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusIndexOnOpen = useRef<number | null>(null);

  useEffect(() => {
    if (props.open && focusIndexOnOpen.current !== null) {
      optionRefs.current[focusIndexOnOpen.current]?.focus();
      focusIndexOnOpen.current = null;
    }
  }, [props.open]);

  if (!activeOption) return null;
  const options = props.options.filter((option) => option.key !== activeOption.key);

  const renderDropdownOption = (option: DropdownOption<K>, index: number) => (
    <button
      className="dropdown__option"
      key={String(option.key)}
      ref={(element) => {
        optionRefs.current[index] = element;
      }}
      role="menuitem"
      tabIndex={-1}
      onClick={() => props.onSelect(option.key)}
      onKeyDown={(event) => {
        const focusOption = (nextIndex: number) => {
          event.preventDefault();
          optionRefs.current[nextIndex]?.focus();
        };

        switch (event.key) {
          case "ArrowDown":
            focusOption((index + 1) % options.length);
            break;
          case "ArrowUp":
            focusOption((index - 1 + options.length) % options.length);
            break;
          case "Home":
            focusOption(0);
            break;
          case "End":
            focusOption(options.length - 1);
            break;
          case "Escape":
            event.preventDefault();
            props.onToggleMenu();
            triggerRef.current?.focus();
            break;
        }
      }}
    >
      <div className="dropdown__option-icon">{option.icon}</div>
      <div className="dropdown__option-label">{option.label}</div>
    </button>
  );

  return (
    <div className={classNames(props.className, "dropdown", {"dropdown--open": props.open})}>
      <button
        ref={triggerRef}
        id={`${dropdownId}-trigger`}
        className={classNames("dropdown__option", "dropdown__option--active")}
        aria-haspopup="menu"
        aria-controls={`${dropdownId}-menu`}
        aria-expanded={props.open}
        onClick={props.onToggleMenu}
        onKeyDown={(event) => {
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && options.length > 0) {
            event.preventDefault();
            focusIndexOnOpen.current = event.key === "ArrowDown" ? 0 : options.length - 1;
            if (props.open) {
              optionRefs.current[focusIndexOnOpen.current]?.focus();
              focusIndexOnOpen.current = null;
            } else {
              props.onToggleMenu();
            }
          } else if (event.key === "Escape" && props.open) {
            event.preventDefault();
            props.onToggleMenu();
          }
        }}
      >
        <div className="dropdown__option-icon">{activeOption.icon}</div>
        <div className="dropdown__option-label">{activeOption.label}</div>
        <div
          className={classNames("dropdown__option-arrow", {
            "dropdown__option-arrow--up": props.open,
            "dropdown__option-arrow--down": !props.open,
          })}
        >
          <ArrowIcon />
        </div>
      </button>
      <div id={`${dropdownId}-menu`} className="dropdown__options-container" role="menu" aria-labelledby={`${dropdownId}-trigger`} hidden={!props.open}>
        {options.map(renderDropdownOption)}
      </div>
    </div>
  );
};
