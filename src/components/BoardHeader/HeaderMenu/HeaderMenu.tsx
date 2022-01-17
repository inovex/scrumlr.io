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

type ExpandableOptions = "share" | "delete" | "export";

const HeaderMenu = (props: HeaderMenuProps) => {
  const state = useSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data,
    user: applicationState.users.all.find((user) => user.id === Parse.User.current()!.id),
    userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
  }));

  const [activeEditMode, setActiveEditMode] = useState(false);
  const [accessPolicy, setAccessPolicy] = useState(state.board!.accessPolicy);
  const [expandedOption, setExpandedOption] = useState<ExpandableOptions | undefined>();

  if (!props.open) {
    return null;
  }

  const onExpand = (option: ExpandableOptions) => () => {
    if (option === expandedOption) {
      setExpandedOption(undefined);
    } else {
      setExpandedOption(option);
    }
  };

  return (
    <Portal
      onClose={() => {
        setActiveEditMode(false);
        setExpandedOption(undefined);
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
            <BoardOption.DeleteBoardOption expand={expandedOption === "delete"} onClick={onExpand("delete")} />
          </>
        )}
        <BoardOption.ShareQrCodeOption expand={expandedOption === "share"} onClick={onExpand("share")} />
        <BoardOption.ExportBoardOption expand={expandedOption === "export"} onClose={props.onClose} onClick={onExpand("export")} />
      </ul>
    </Portal>
  );
};

export {HeaderMenu};
