import {FC, PropsWithChildren} from "react";
import classNames from "classnames";
import "./Footer.scss";

type FooterProps = {
  visible: boolean;
  className?: string;
};

export const Footer: FC<PropsWithChildren<FooterProps>> = ({children, visible, className}) => (
  <footer className={classNames("settings-dialog__footer", {"settings-dialog__footer-visible": visible}, className)}>{children}</footer>
);
