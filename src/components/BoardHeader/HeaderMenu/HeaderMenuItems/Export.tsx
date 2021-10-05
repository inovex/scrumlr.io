import {useAppSelector} from "store";
import {exportAsCSV, exportAsJSON} from "utils/export";
import {ApplicationState} from "types/store";
import {ReactComponent as ExportIcon} from "assets/icon-share.svg";
import {Dispatch, SetStateAction} from "react";
import "./HeaderMenuItems.scss";
import classNames from "classnames";

export type ExportProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showExport: boolean;
};

export const Export = (props: ExportProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    notes: applicationState.notes,
    users: applicationState.users,
    votes: applicationState.votes,
  }));

  return (
    <div className="menu__item-button">
      <li className="header-menu__item">
        <button
          className="menu__item-button"
          onClick={() => {
            props.setShowDelete(false);
            props.setShowQrCode(false);
            props.setShowExport(!props.showExport);
          }}
        >
          <ExportIcon className="item-button__icon" />
          <label className="item-button__label">Export board</label>
        </button>
      </li>
      <li className={classNames("header-menu__export-container", {"header-menu__export-container--visible": props.showExport})}>
        <button className="menu__item-button" onClick={() => exportAsJSON(state)}>
          <ExportIcon className="item-button__icon" />
          <label className="item-button__label">Export as json</label>
        </button>
        <button className="menu__item-button" onClick={() => exportAsCSV(state)}>
          <ExportIcon className="item-button__icon" />
          <label className="item-button__label">Export as csv</label>
        </button>
      </li>
    </div>
  );
};
