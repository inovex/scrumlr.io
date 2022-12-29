import classNames from "classnames";
import {FC, PropsWithChildren} from "react";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import "./SettingsAccordion.scss";

export type SettingsAccordionProps = {
  isOpen: boolean;
  onClick: () => unknown;
  label?: string;
  headerClassName?: string;
  className?: string;
} & PropsWithChildren;

export const SettingsAccordion: FC<SettingsAccordionProps> = ({label, isOpen, onClick, children, className, headerClassName}) => (
  <div className={classNames("accordion-item", className)}>
    <button className={classNames("accordion-item__header", headerClassName)} onClick={onClick}>
      {label}
      <DropdownIcon className={classNames("accordion-item__header-icon", {"accordion-item__header-icon--open": isOpen})} />
    </button>
    {isOpen && <div className="accordion-item__body">{children}</div>}
  </div>
);
