import {FC} from "react";
import {useTranslation} from "react-i18next";
import {animated, Transition} from "react-spring";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {Portal} from "components/Portal";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as WarningIcon} from "assets/icon-warning.svg";
import classNames from "classnames";
import "./ConfirmationDialog.scss";

type ConfirmationDialogProps = {
  title: string;
  onAccept: () => void;
  onAcceptLabel?: string;
  onDecline?: () => void;
  onDeclineLabel?: string;
  onExtraOption?: () => void;
  onExtraOptionLabel?: string;
  onClose: () => void;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  warning?: string;
  reverseButtonOrder?: boolean;
};

export const ConfirmationDialog: FC<ConfirmationDialogProps> = (props) => {
  const {t} = useTranslation();

  return (
    <Portal onClose={props.onClose}>
      <div className="confirmation-dialog__background" />
      <div className="confirmation-dialog__wrapper">
        <Transition {...dialogTransitionConfig}>
          {(styles) => (
            <animated.aside aria-modal="true" aria-label={props.title} className="confirmation-dialog" role="dialog" style={styles}>
              <button aria-label="Close dialog" className="confirmation-dialog__close-button" onClick={() => props.onClose()} type="button">
                <CloseIcon className="dialog__close-icon" />
              </button>
              <div className="confirmation-dialog__icon-content-wrapper">
                {props.icon && (
                  <div className="confirmation-dialog__icon">
                    <props.icon />
                  </div>
                )}
                <div className="confirmation-dialog__content">
                  <div>
                    <h2 className="confirmation-dialog__title">{props.title}</h2>
                    {props.warning && (
                      <div className="confirmation-dialog__warning">
                        <WarningIcon />
                        <p>{props.warning}</p>
                      </div>
                    )}
                  </div>
                  <div className={classNames("confirmation-dialog__buttons", {"confirmation-dialog__buttons-reverse": props.reverseButtonOrder})}>
                    <button
                      aria-label={props.onAcceptLabel ?? t("ConfirmationDialog.yes")}
                      className="confirmation-dialog__button confirmation-dialog__button--accept"
                      onClick={() => props.onAccept()}
                      type="button"
                    >
                      {props.onAcceptLabel ?? t("ConfirmationDialog.yes")}
                    </button>
                    {props.onExtraOption && props.onExtraOptionLabel && (
                      <button
                        aria-label={props.onExtraOptionLabel}
                        className="confirmation-dialog__button confirmation-dialog__button--decline"
                        onClick={() => props.onExtraOption!()}
                        type="button"
                      >
                        {props.onExtraOptionLabel}
                      </button>
                    )}
                    {props.onDecline && (
                      <button
                        aria-label={props.onDeclineLabel ?? t("ConfirmationDialog.no")}
                        className="confirmation-dialog__button confirmation-dialog__button--decline"
                        onClick={() => props.onDecline && props.onDecline()}
                        type="button"
                      >
                        {props.onDeclineLabel ?? t("ConfirmationDialog.no")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </animated.aside>
          )}
        </Transition>
      </div>
    </Portal>
  );
};
