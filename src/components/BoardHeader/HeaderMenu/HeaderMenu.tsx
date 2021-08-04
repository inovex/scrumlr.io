import "./HeaderMenu.scss";
import classnames from "classnames";

type HeaderMenuProps = {
  open: boolean;
};

const HeaderMenu = (props: HeaderMenuProps) => <div className={classnames("header-menu", {"header-menu--active": props.open})} />;

export {HeaderMenu};
