import {ElementType, useState, FocusEvent, FC, useRef, useEffect} from "react";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import "./SettingsDropdown.scss";
import classNames from "classnames";

interface SettingsDropdownProps {
  label: string;
  items: DropdownItem[];
  current: DropdownItem;
}

interface DropdownItem {
  icon?: ElementType;
  text: string;
  callback?: () => unknown;
}

export const SettingsDropdown: FC<SettingsDropdownProps> = ({label, items, current}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      dropdownListRef.current?.scrollIntoView();
    }
  }, [isOpen]);

  const handleBlur = (e: FocusEvent<HTMLDivElement, Element>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
  };

  const handleClick = (callback?: DropdownItem["callback"]) => {
    if (callback) callback();
    setIsOpen(!isOpen);
  };

  return (
    // onBlur is not working on webkit due to not focussing the element.
    <div className="settings-dropdown" onBlur={(e) => handleBlur(e)}>
      <button className="settings-dropdown__button" onClick={() => handleClick()} role="combobox" aria-controls="dropdown-list" aria-expanded={isOpen}>
        <span>{label}</span>
        <p className="settings-dropdown__item--current">
          {current.icon && <current.icon className="settings-dropdown__item-icon" />}
          <span>{current.text}</span>
          <DropdownIcon className="settings-dropdown__item-icon settings-dropdown__item-icon--dropdown" />
        </p>
      </button>
      <ul id="dropdown-list" className={classNames({"settings-dropdown__list": true, active: isOpen})} role="listbox" ref={dropdownListRef}>
        {items
          .filter((item) => current !== item)
          .map((item) => (
            <li className="settings-dropdown__item" key={item.text}>
              <button className="settings-dropdown__button" onClick={() => handleClick(item.callback)}>
                {item.icon && <item.icon className="settings-dropdown__item-icon" />}
                <span>{item.text}</span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};
