import {FC} from "react";
import className from "classnames";
import {Portal} from "components/Portal";
import "./Dialog.scss";

type DialogProps = {
  title: string;
  className?: string;
  onClose?: () => void;
};

export const Dialog: FC<DialogProps> = (props) => (
  <Portal darkBackground={false} onClose={() => props.onClose?.()}>
    <aside className={className("dialog", props.className)}>
      <article className="dialog__content">
        <h2 className="dialog__header-text">{props.title}</h2>
        {props.children}
      </article>
    </aside>
  </Portal>
);
