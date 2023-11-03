import {FC, HTMLAttributes, PropsWithChildren} from "react";
import classNames from "classnames";
import {Portal} from "components/Portal";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./Dialog.scss";
import {useTranslation} from "react-i18next";

type DialogProps = {
  title: string;
  onClose?: () => void;
} & HTMLAttributes<HTMLDivElement>;

export const Dialog: FC<PropsWithChildren<DialogProps>> = ({title, className, onClose, children, ...other}) => {
  const {t} = useTranslation();

  return (
    <Portal onClose={() => onClose?.()}>
      <aside className={classNames("dialog", className)} {...other} onClick={(e) => e.stopPropagation()}>
        <article className="dialog__content">
          <h2 className="dialog__header-text">{title}</h2>
          {children}
        </article>
        <button onClick={() => onClose?.()} className="dialog__close-button" aria-label={t("ConfirmationDialog.close")}>
          <CloseIcon className="dialog__close-icon" />
        </button>
      </aside>
    </Portal>
  );
};
