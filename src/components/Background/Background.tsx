import {FC, PropsWithChildren} from "react";
import classNames from "classnames";
import "./Background.scss";

export const Background: FC<PropsWithChildren> = ({children}) => <div className={classNames("background")}>{children}</div>;
