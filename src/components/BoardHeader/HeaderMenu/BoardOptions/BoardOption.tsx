import {FC, PropsWithChildren} from "react";
import "./BoardOption.scss";
import classNames from "classnames";

export interface BoardOptionProps {
  className?: string;
  [key: string]: unknown;
}

export const BoardOption: FC<PropsWithChildren<BoardOptionProps>> = ({className, children, ...other}) => (
  <li className={classNames("board-option", className)} {...other}>
    {children}
  </li>
);
