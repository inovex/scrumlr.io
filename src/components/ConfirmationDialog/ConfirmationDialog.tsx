import {FC} from "react";
import {useTranslation} from "react-i18next";
import {animated, Transition} from "@react-spring/web";
import {dialogTransitionConfig} from "utils/transitionConfig";
import {Portal} from "components/Portal";
import {Close, Warning} from "components/Icon";
import classNames from "classnames";
import "./ConfirmationDialog.scss";

type CheckboxConfig = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  showError?: boolean;
};

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
  text?: string;
  items?: string;
  textAfterItems?: string;
  className?: string;
  checkbox?: CheckboxConfig;
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
                        <Warning />
                        <p>{t("ConfirmationDialog.warning")}</p>
                      </div>
                    )}
                    {props.text && (
                      <div className="confirmation-dialog__text">
                        <p>{t(props.text)}</p>
                      </div>
                    )}
                    {props.items && (
                      <ul className="confirmation-dialog__items">
                        {props.items.split("\n").map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {props.textAfterItems && (
                      <div className="confirmation-dialog__text">
                        <p>{t(props.textAfterItems)}</p>
                      </div>
                    )}
                    {props.checkbox && (
                      <label className="confirmation-dialog__checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="confirmation-dialog__checkbox"
                          checked={props.checkbox.checked}
                          onChange={(e) => props.checkbox?.onChange?.(e.target.checked)}
                        />
                        <span className="confirmation-dialog__checkbox-label">{props.checkbox.label}</span>
                      </label>
                    )}
                  </div>
                  {props.checkbox && (
                    <div className="confirmation-dialog__error-message">
                      {props.checkbox.showError && (
                        <>
                          <Warning className="" />
                          <p>{t("ConfirmationDialog.deleteAccountWarning")}</p>
                        </>
                      )}
                    </div>
                  )}
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
