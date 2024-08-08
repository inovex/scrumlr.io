import {ReactNode} from "react";
import "./MiniMenu.scss";

type MiniMenuItem = {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
};

type MiniMenuProps = {
  open: boolean;
  items: MiniMenuItem[];
};

export const MiniMenu = (props: MiniMenuProps) => <div>Hello MiniMenu</div>;
