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

type ExpandableOptions = "share" | "delete" | "export";

const HeaderMenu = (props: HeaderMenuProps) => {
  const [activeEditMode, setActiveEditMode] = useState(false);
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
        props.onClose();
      }}
    >
      <ul className="header-menu">
        <BoardSettings activeEditMode={activeEditMode} currentUserIsModerator={props.currentUserIsModerator} setActiveEditMode={setActiveEditMode} />
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
