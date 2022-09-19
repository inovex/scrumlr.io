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

const HeaderMenu = ({open, onClose, currentUserIsModerator}: HeaderMenuProps) => {
  const [activeEditMode, setActiveEditMode] = useState(false);

  if (!open) {
    return null;
  }

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        onClose();
      }}
    >
      <ul className="header-menu" onClick={(e) => e.stopPropagation()}>
        <BoardSettings activeEditMode={activeEditMode} currentUserIsModerator={currentUserIsModerator} setActiveEditMode={setActiveEditMode} />
        {currentUserIsModerator && (
          <>
            <BoardOption.ShowAuthorOption />
            <BoardOption.ShowOtherUsersNotesOption />
            <BoardOption.ShowHiddenColumnsOption />
          </>
        )}
        <BoardOption.ShowAllBoardSettings onClose={onClose} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
