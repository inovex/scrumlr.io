import {FC, PropsWithChildren} from "react";
import "./Footer.scss";

type FooterProps = {
  className?: string;
};

export const Footer: FC<PropsWithChildren<FooterProps>> = ({children, className}) => (
    <footer className={`container ${className || ""}`}>
      {children}
    </footer>
  );
