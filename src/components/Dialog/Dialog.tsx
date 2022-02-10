import {FC} from "react";
import classNames from "classnames";
import {Portal} from "components/Portal";
import "./Dialog.scss";

type DialogProps = {
  title: string;
  className?: string;
  onClose?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const Dialog: FC<DialogProps> = ({title, className, onClose, children, ...other}) => (
  <Portal darkBackground={false} onClose={() => onClose?.()}>
    <aside className={classNames("dialog", className)} {...other}>
      <article className="dialog__content">
        <h2 className="dialog__header-text">{title}</h2>
        {children}
      </article>
    </aside>
  </Portal>
);
