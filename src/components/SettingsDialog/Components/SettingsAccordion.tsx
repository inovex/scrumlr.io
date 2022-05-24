import classNames from "classnames";
import {FC, ReactElement} from "react";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import "./SettingsAccordion.scss";

export interface SettingsAccordionProps {
  children: ReactElement | ReactElement[];
  isOpen: boolean;
  onClick: () => unknown;
  label?: string;
  headerClassName?: string;
  className?: string;
}

export const SettingsAccordion: FC<SettingsAccordionProps> = ({label, isOpen, onClick, children, className, headerClassName}) => (
  <div className={classNames("accordion-item", className)}>
    <button className={classNames("accordion-item__header", headerClassName)} onClick={onClick}>
      {label}
      <DropdownIcon className={classNames("accordion-item__header-icon", {"accordion-item__header-icon--open": isOpen})} />
    </button>
    <div className={classNames("accordion-item__body", {"accordion-item__body--open": isOpen})}>{children}</div>
  </div>
);
