import {MouseEventHandler} from "react";
import {Link} from "react-router-dom";
import classNames from "classnames";
import "./BoardOptionLink.scss";

export type BoardOptionLinkProps = {
  to: string;
  label: string;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
};

export const BoardOptionLink = (props: BoardOptionLinkProps) => (
  <Link to={props.to} onClick={props.onClick} className={classNames("board-option-link")}>
    <p className="board-option-link__label">{props.label}</p>
  </Link>
);
