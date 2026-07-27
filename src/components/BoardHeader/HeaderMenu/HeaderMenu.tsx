import {Portal} from "components/Portal";
import {useState} from "react";
import {ParticipantRole} from "store/features";
import {isParticipantModerator} from "utils/participant";
import {BoardOption} from "./BoardOptions";
import {BoardSettings} from "./BoardSettings";
import "./HeaderMenu.scss";

type HeaderMenuProps = {
  open: boolean;
  onClose: () => void;
  userRole: ParticipantRole;
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
      align="here"
    >
      <ul className="header-menu">
        <BoardSettings activeEditMode={activeEditMode} userRole={props.userRole} setActiveEditMode={setActiveEditMode} />
        {isParticipantModerator(props.userRole) && (
          <>
            <BoardOption.ShowAuthorOption />
            <BoardOption.ShowOtherUsersNotesOption />
            <BoardOption.ShowHiddenColumnsOption />
            <BoardOption.LockBoard />
          </>
        )}
        <BoardOption.ShowAllBoardSettings onClose={props.onClose} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
