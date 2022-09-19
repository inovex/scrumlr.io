import {MouseEventHandler} from "react";
import {Link} from "react-router-dom";
import classNames from "classnames";
import "./BoardOptionLink.scss";

export type BoardOptionLinkProps = {
  to: string;
  label: string;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
};

export const BoardOptionLink = ({to, label, onClick}: BoardOptionLinkProps) => (
  <Link to={to} onClick={onClick} className={classNames("board-option-link")}>
    <p className="board-option-link__label">{label}</p>
  </Link>
);
