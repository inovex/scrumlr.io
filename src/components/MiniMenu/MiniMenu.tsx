import {ReactNode} from "react";
import classNames from "classnames";
import "./MiniMenu.scss";

type MiniMenuItem = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type MiniMenuProps = {
  className?: string;
  items: MiniMenuItem[];
};

export const MiniMenu = (props: MiniMenuProps) => <div className={classNames(props.className, "mini-menu")}>Hello MiniMenu</div>;
