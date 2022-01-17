import {Portal} from "components/Portal";
import Parse from "parse";
import {useState} from "react";
import {useSelector} from "react-redux";
import {ApplicationState} from "types/store";
import "./HeaderMenu.scss";
import {Link} from "react-router-dom";
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
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
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
      darkBackground={false}
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
        <li className="board-option">
          <Link to="settings">Show all Board Settings</Link>
        </li>
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
