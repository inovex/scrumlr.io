import {ReactNode} from "react";
import {Button} from "components/Button";
import {CloseIcon} from "components/Icon";
import classNames from "classnames";
import "./SimpleModal.scss";

type SimpleModalButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type SimpleModalProps = {
  className: string;
  title: string;
  children: ReactNode;

  secondaryButton: SimpleModalButtonProps;
  primaryButton: SimpleModalButtonProps;
};

export const SimpleModal = (props: SimpleModalProps) => (
  <div className={classNames(props.className, "simple-modal")}>
    <header className="simple-modal__header">
      <button className="simple-modal__close-button" onClick={props.secondaryButton.onClick} aria-label="Close modal">
        <CloseIcon className="simple-modal__close-icon" />
      </button>
      <div className="simple-modal__title">{props.title}</div>
    </header>
    <main className="simple-modal__main">{props.children}</main>
    <footer className="simple-modal__footer">
      <Button variant="secondary" onClick={props.secondaryButton.onClick} disabled={props.secondaryButton.disabled} dataCy="simple-modal__secondary-button">
        {props.secondaryButton.label}
      </Button>
      <Button variant="primary" onClick={props.primaryButton.onClick} disabled={props.primaryButton.disabled} dataCy="simple-modal__primary-button">
        {props.primaryButton.label}
      </Button>
    </footer>
  </div>
);
