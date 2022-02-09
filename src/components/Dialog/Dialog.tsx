import {FC} from "react";
import className from "classnames";
import {Portal} from "components/Portal";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./Dialog.scss";

type DialogProps = {
  title: string;
  className?: string;
  onClose?: () => void;
};

export const Dialog: FC<DialogProps> = (props) => (
  <Portal darkBackground onClose={() => props.onClose?.()}>
    <aside className={className("dialog", props.className)}>
      <article className="dialog__content">
        <h2 className="dialog__header-text">{props.title}</h2>
        {props.children}
        <button onClick={() => props.onClose?.()} className="dialog__close-button" data-testid="dialog__close-button">
          <CloseIcon className="close-button__icon" />
        </button>
      </article>
    </aside>
  </Portal>
);
