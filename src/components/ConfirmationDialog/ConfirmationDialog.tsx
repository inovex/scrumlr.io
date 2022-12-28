import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {Portal} from "components/Portal";
import {animated, Transition} from "react-spring";
import "./ConfirmationDialog.scss";

type ConfirmationDialogProps = {
  title: string;
  icon?: React.FC;
  onAccept: () => void;
  onDecline: () => void;
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (props) => {
  const transitionConfig = {
    from: {opacity: 0, transform: "translateY(-20px)"},
    enter: {opacity: 1, transform: "translateY(0px)"},
    items: true,
  };

  return (
    <Portal onClose={props.onDecline}>
      <div className="confirmation-dialog__background" />
      <div className="confirmation-dialog__wrapper">
        <Transition {...transitionConfig}>
          {(styles) => (
            <animated.aside style={styles} className="confirmation-dialog">
              <button onClick={() => props.onDecline()} className="confirmation-dialog__close-button">
                <CloseIcon className="dialog__close-icon" />
              </button>
              <h2 className="confirmation-dialog__title">{props.title}</h2>
              <div className="confirmation-dialog__buttons">
                <button className="confirmation-dialog__button confirmation-dialog__button--accept" onClick={() => props.onAccept()}>
                  Yes
                </button>
                <button className="confirmation-dialog__button confirmation-dialog__button--decline" onClick={() => props.onDecline()}>
                  No
                </button>
              </div>
            </animated.aside>
          )}
        </Transition>
      </div>
    </Portal>
  );
};
