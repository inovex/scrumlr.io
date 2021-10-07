import {useState} from "react";
import {ApplicationState} from "types/store";
import {useSelector} from "react-redux";
import Portal from "components/Portal/Portal";
import Parse from "parse";
import "./HeaderMenu.scss";
import {Export} from "./HeaderMenuItems/Export";
import {Delete} from "./HeaderMenuItems/Delete";
import {QrCode} from "./HeaderMenuItems/QRCode";
import {Note} from "./HeaderMenuItems/Note";
import {Columns} from "./HeaderMenuItems/Columns";
import {Author} from "./HeaderMenuItems/Author";
import {BoardHeaderSetting} from "./HeaderMenuItems/BoardHeaderSetting";

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
        <BoardHeaderSetting
          activeEditMode={activeEditMode}
          joinConfirmationRequired={joinConfirmationRequired}
          boardName={boardName}
          currentUserIsModerator={props.currentUserIsModerator}
          setActiveEditMode={setActiveEditMode}
          setBoardName={setBoardName}
          setJoinConfirmationRequired={setJoinConfirmationRequired}
        />
        {props.currentUserIsModerator && (
          <div className="header-menu-moderator">
            <Author />
            <Note />
            <Columns />
            <QrCode showQrCode={showQrCode} setShowExport={setShowExport} setShowDelete={setShowDelete} setShowQrCode={setShowQrCode} />
            <Delete showDelete={showDelete} setShowExport={setShowExport} setShowDelete={setShowDelete} setShowQrCode={setShowQrCode} />
          </div>
        )}
        <Export showExport={showExport} setShowExport={setShowExport} setShowDelete={setShowDelete} setShowQrCode={setShowQrCode} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
