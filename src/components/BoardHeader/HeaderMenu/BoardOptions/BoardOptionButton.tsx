import {FC, ReactNode, ElementType} from "react";
import "./BoardOptionButton.scss";
import classNames from "classnames";

export interface BoardOptionButtonProps {
  label: string;
  icon?: ElementType;
  onClick: (...args: any) => any;
  className?: string;
  isExpandable?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

export const BoardOptionButton: FC<BoardOptionButtonProps> = ({label, icon, onClick, isExpandable = false, className, children, ...other}) => {
  const Icon = icon!;

  return (
    <button className={classNames("board-option-button", {"board-option-button--expandable": isExpandable})} onClick={onClick} {...other}>
      {icon && <Icon className="board-option-button__icon" />}
      {children}
      <span className="board-option-button__label">{label}</span>
    </button>
  );
};
