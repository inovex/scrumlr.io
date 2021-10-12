import {FC, ReactNode, ElementType} from "react";
import "./BoardOptionButton.scss";

export interface BoardOptionButtonProps {
  label: string;
  icon?: ElementType;
  onClick: (...args: any) => any;
  children?: ReactNode;
}

export const BoardOptionButton: FC<BoardOptionButtonProps> = ({label, icon, onClick, children}) => {
  const Icon = icon!;

  return (
    <button className="board-option-button" onClick={onClick}>
      {icon && <Icon className="board-option-button__icon" />}
      {children}
      <span className="board-option-button__label">{label}</span>
    </button>
  );
};
