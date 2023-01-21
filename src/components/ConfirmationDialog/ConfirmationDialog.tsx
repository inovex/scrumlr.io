import {FC} from "react";
import {useTranslation} from "react-i18next";
import {animated, Transition} from "react-spring";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {Portal} from "components/Portal";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./ConfirmationDialog.scss";

type ConfirmationDialogProps = {
  title: string;
  onAccept: () => void;
  onAcceptLabel?: string;
  onDecline: () => void;
  onDeclineLabel?: string;
};

export const ConfirmationDialog: FC<ConfirmationDialogProps> = (props) => {
  const {t} = useTranslation();

  return (
    <Portal onClose={props.onDecline}>
      <div className="confirmation-dialog__background" />
      <div className="confirmation-dialog__wrapper">
        <Transition {...dialogTransitionConfig}>
          {(styles) => (
            <animated.aside aria-modal="true" aria-label={props.title} className="confirmation-dialog" role="dialog" style={styles}>
              <button aria-label="Close dialog" className="confirmation-dialog__close-button" onClick={() => props.onDecline()} type="button">
                <CloseIcon className="dialog__close-icon" />
              </button>
              <h2 className="confirmation-dialog__title">{props.title}</h2>
              <div className="confirmation-dialog__buttons">
                <button
                  aria-label={props.onAcceptLabel ?? t("ConfirmationDialog.yes")}
                  className="confirmation-dialog__button confirmation-dialog__button--accept"
                  onClick={() => props.onAccept()}
                  type="button"
                >
                  {props.onAcceptLabel ?? t("ConfirmationDialog.yes")}
                </button>
                <button
                  aria-label={props.onDeclineLabel ?? t("ConfirmationDialog.no")}
                  className="confirmation-dialog__button confirmation-dialog__button--decline"
                  onClick={() => props.onDecline()}
                  type="button"
                >
                  {props.onDeclineLabel ?? t("ConfirmationDialog.no")}
                </button>
              </div>
            </animated.aside>
          )}
        </Transition>
      </div>
    </Portal>
  );
};
