import {useAppSelector} from "store";
import {exportAsCSV, exportAsJSON} from "utils/export";
import {ApplicationState} from "types/store";
import {ReactComponent as ExportIcon} from "assets/icon-share.svg";
import {Dispatch, SetStateAction} from "react";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import "./ExportBoardOption.scss";

export type ExportProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  showExport: boolean;
};

export const ExportBoardOption = (props: ExportProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    notes: applicationState.notes,
    users: applicationState.users,
    votes: applicationState.votes,
  }));

  return (
    <BoardOption data-testid="export">
      <BoardOptionButton
        label="Export board"
        icon={ExportIcon}
        isExpandable
        onClick={() => {
          props.setShowDelete(false);
          props.setShowQrCode(false);
          props.setShowExport(!props.showExport);
        }}
      />
      <div className={classNames("export-board-option__container", {"export-board-option__container--visible": props.showExport})}>
        <BoardOptionButton
          label="Export as json"
          icon={ExportIcon}
          onClick={() => {
            exportAsJSON(state);
            props.onClose();
          }}
          data-testid="export-json"
        />
        <BoardOptionButton
          label="Export as csv"
          icon={ExportIcon}
          onClick={() => {
            exportAsCSV(state);
            props.onClose();
          }}
          data-testid="export-csv"
        />
      </div>
    </BoardOption>
  );
};
