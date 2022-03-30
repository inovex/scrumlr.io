import {Portal} from "components/Portal";
import {useState} from "react";
import {useSelector} from "react-redux";
import {ApplicationState} from "types";
import "./HeaderMenu.scss";
import {BoardOption} from "./BoardOptions";
import {BoardSettings} from "./BoardSettings";

type HeaderMenuProps = {
  open: boolean;
  onClose: () => void;
  currentUserIsModerator: boolean;
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const state = useSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data,
  }));

  const [activeEditMode, setActiveEditMode] = useState(false);
  const [accessPolicy, setAccessPolicy] = useState(state.board!.accessPolicy);

  if (!props.open) {
    return null;
  }

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        setAccessPolicy(state.board!.accessPolicy);
        props.onClose();
      }}
    >
      <ul className="header-menu">
        <BoardSettings
          activeEditMode={activeEditMode}
          accessPolicy={accessPolicy}
          currentUserIsModerator={props.currentUserIsModerator}
          setActiveEditMode={setActiveEditMode}
          setAccessPolicy={setAccessPolicy}
        />
        {props.currentUserIsModerator && (
          <>
            <BoardOption.ShowAuthorOption />
            <BoardOption.ShowOtherUsersNotesOption />
            <BoardOption.ShowHiddenColumnsOption />
          </>
        )}
        <BoardOption.ShowAllBoardSettings onClose={props.onClose} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
