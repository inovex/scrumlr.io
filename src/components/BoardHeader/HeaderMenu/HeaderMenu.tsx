import "./HeaderMenu.scss";
import Portal from "components/Portal/Portal";

type HeaderMenuProps = {
  open: boolean;
  onClose: () => void;
};

const HeaderMenu = (props: HeaderMenuProps) => {
  if (!props.open) {
    return null;
  }

  return (
    <Portal onClose={props.onClose}>
      <div className="header-menu" />
    </Portal>
  );
};

export {HeaderMenu};
