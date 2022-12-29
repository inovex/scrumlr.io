import {FC, PropsWithChildren} from "react";
import "./BoardOption.scss";
import classNames from "classnames";

export type BoardOptionProps = {
  className?: string;
  [key: string]: unknown;
} & PropsWithChildren;

export const BoardOption: FC<BoardOptionProps> = ({className, children, ...other}) => (
  <li className={classNames("board-option", className)} {...other}>
    {children}
  </li>
);
