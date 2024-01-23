import {Portal} from "components/Portal";
import {useState} from "react";
import "./HeaderMenu.scss";
import {BoardOption} from "./BoardOptions";
import {BoardSettings} from "./BoardSettings";

type HeaderMenuProps = {
  open: boolean;
  onClose: () => void;
  currentUserIsModerator: boolean;
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const [activeEditMode, setActiveEditMode] = useState(false);

  if (!props.open) {
    return null;
  }

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        props.onClose();
      }}
    >
      <ul className="header-menu" onClick={(e) => e.stopPropagation()}>
        <BoardSettings activeEditMode={activeEditMode} currentUserIsModerator={props.currentUserIsModerator} setActiveEditMode={setActiveEditMode} />
        {props.currentUserIsModerator && (
          <>
            <BoardOption.ShowAuthorOption />
            <BoardOption.ShowOtherUsersNotesOption />
            <BoardOption.ShowHiddenColumnsOption />
            <BoardOption.ShowAllowEditingOption />
          </>
        )}
        <BoardOption.ShowAllBoardSettings onClose={props.onClose} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
