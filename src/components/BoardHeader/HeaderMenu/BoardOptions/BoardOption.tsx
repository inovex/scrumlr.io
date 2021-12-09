import {FC} from "react";
import "./BoardOption.scss";
import classNames from "classnames";

export interface BoardOptionProps {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const BoardOption: FC<BoardOptionProps> = ({className, children, ...other}) => (
  <li className={classNames("board-option", className)} {...other}>
    {children}
  </li>
);
