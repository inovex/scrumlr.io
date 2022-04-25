import classNames from "classnames";
import {FC, ReactElement, useState} from "react";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import "./SettingsAccordion.scss";

export interface SettingsAccordionProps {
  children: ReactElement | ReactElement[];
  label?: string;
}

export const SettingsAccordion: FC<SettingsAccordionProps> = ({label, children}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button className="accordion-item__header" onClick={() => setIsOpen(!isOpen)}>
        {label}
        <DropdownIcon className={classNames("accordion-item__header-icon", {"accordion-item__header-icon--open": isOpen})} />
      </button>
      <div className={classNames("accordion-item__body", {"accordion-item__body--open": isOpen})}>{children}</div>
    </div>
  );
};
