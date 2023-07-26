import {FC, PropsWithChildren} from "react";
import classNames from "classnames";

type SettingsFooterProps = {
  className?: string;
};

export const SettingsFooter: FC<PropsWithChildren<SettingsFooterProps>> = ({children, className}) => (
  <div className={classNames("settings-dialog__footer", className)}>{children}</div>
);
