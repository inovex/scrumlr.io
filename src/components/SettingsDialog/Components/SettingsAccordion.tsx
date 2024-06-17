import classNames from "classnames";
import {FC, PropsWithChildren} from "react";
import {ArrowRight} from "components/Icon";
import "./SettingsAccordion.scss";

export interface SettingsAccordionProps {
  isOpen: boolean;
  onClick: () => unknown;
  label?: string;
  headerClassName?: string;
  className?: string;
}

export const SettingsAccordion: FC<PropsWithChildren<SettingsAccordionProps>> = ({label, isOpen, onClick, children, className, headerClassName}) => (
  <div className={classNames("accordion-item", className)}>
    <button className={classNames("accordion-item__header", headerClassName)} onClick={onClick}>
      {label}
      <ArrowRight className={classNames("accordion-item__header-icon", {"accordion-item__header-icon--open": isOpen})} />
    </button>
    {isOpen && <div className="accordion-item__body">{children}</div>}
  </div>
);
