import {Portal} from "components/Portal";
import Parse from "parse";
import {useState} from "react";
import {useSelector} from "react-redux";
import {ApplicationState} from "types/store";
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
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  const [boardName, setBoardName] = useState(state.board!.name);
  const [activeEditMode, setActiveEditMode] = useState(false);
  const [joinConfirmationRequired, setJoinConfirmationRequired] = useState(state.board!.joinConfirmationRequired);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showExport, setShowExport] = useState(false);

  if (!props.open) {
    return null;
  }

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        setShowQrCode(false);
        setShowDelete(false);
        setShowExport(false);
        setBoardName(state.board!.name);
        setJoinConfirmationRequired(state.board!.joinConfirmationRequired);
        props.onClose();
      }}
      darkBackground={false}
    >
      <ul className="header-menu">
        <BoardSettings
          activeEditMode={activeEditMode}
          joinConfirmationRequired={joinConfirmationRequired}
          boardName={boardName}
          currentUserIsModerator={props.currentUserIsModerator}
          setActiveEditMode={setActiveEditMode}
          setBoardName={setBoardName}
          setJoinConfirmationRequired={setJoinConfirmationRequired}
        />
        {props.currentUserIsModerator && (
          <>
            <BoardOption.ShowAuthorOption />
            <BoardOption.ShowOtherUsersNotesOption />
            <BoardOption.ShowHiddenColumnsOption />
            <BoardOption.ShareQrCodeOption showQrCode={showQrCode} setShowExport={setShowExport} setShowDelete={setShowDelete} setShowQrCode={setShowQrCode} />
            <BoardOption.DeleteBoardOption showDelete={showDelete} setShowExport={setShowExport} setShowDelete={setShowDelete} setShowQrCode={setShowQrCode} />
          </>
        )}
        <BoardOption.ExportBoardOption showExport={showExport} setShowExport={setShowExport} setShowDelete={setShowDelete} setShowQrCode={setShowQrCode} onClose={props.onClose} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
