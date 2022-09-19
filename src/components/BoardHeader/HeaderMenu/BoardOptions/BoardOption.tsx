import {FC} from "react";
import "./BoardOption.scss";
import classNames from "classnames";

type BoardOptionProps = {
  className?: string;
  [key: string]: unknown;
};

export const BoardOption: FC<BoardOptionProps> = ({className, children, ...other}) => (
  <li className={classNames("board-option", className)} {...other}>
    {children}
  </li>
);
