import {FC} from "react";
import {useTranslation} from "react-i18next";
import {animated, Transition} from "@react-spring/web";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {Portal} from "components/Portal";
import {Close} from "components/Icon";
import {ReactComponent as WarningIcon} from "assets/icon-warning.svg";
import classNames from "classnames";
import "./ConfirmationDialog.scss";

type ConfirmationDialogProps = {
  title: string;
  onAccept: () => void;
  onAcceptLabel?: string;
  onDecline: () => void;
  onDeclineLabel?: string;
  onExtraOption?: () => void;
  onExtraOptionLabel?: string;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  warning?: boolean;
  className?: string;
};

export const ConfirmationDialog: FC<ConfirmationDialogProps> = (props) => {
  const {t} = useTranslation();

  return (
    <Portal onClose={props.onDecline}>
      <div className="confirmation-dialog__background" />
      <div className={classNames("confirmation-dialog__wrapper", props.className)}>
        <Transition {...dialogTransitionConfig}>
          {(styles) => (
            <animated.aside aria-modal="true" aria-label={props.title} className="confirmation-dialog" role="dialog" style={styles} onClick={(e) => e.stopPropagation()}>
              <button aria-label="Close dialog" className="confirmation-dialog__close-button" onClick={() => props.onDecline()} type="button">
                <Close className="dialog__close-icon" />
              </button>
              <div className="confirmation-dialog__icon-content-wrapper">
                {props.icon && <props.icon className="confirmation-dialog__icon" />}
                <div className="confirmation-dialog__content">
                  <div>
                    <h2 className="confirmation-dialog__title">{props.title}</h2>
                    {props.warning && (
                      <div className="confirmation-dialog__warning">
                        <WarningIcon />
                        <p>{t("ConfirmationDialog.warning")}</p>
                      </div>
                    )}
                  </div>
                  <div className="confirmation-dialog__buttons">
                    <button
                      aria-label={props.onDeclineLabel ?? t("ConfirmationDialog.no")}
                      className="confirmation-dialog__button confirmation-dialog__button--decline"
                      onClick={() => props.onDecline()}
                      type="button"
                    >
                      {props.onDeclineLabel ?? t("ConfirmationDialog.no")}
                    </button>
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
