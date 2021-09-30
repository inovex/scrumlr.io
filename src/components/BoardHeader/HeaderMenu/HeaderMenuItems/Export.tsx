import {useAppSelector} from "store";
import {exportAsCSV, exportAsJSON} from "utils/export";
import {ApplicationState} from "types/store";
import {ReactComponent as ExportIcon} from "assets/icon-share.svg";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import "./HeaderMenuItems.scss";
import "../HeaderMenu.scss";
import classNames from "classnames";

export type ExportProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showExport: boolean;
};

export const Export = (props: ExportProps) => {
  const exportState = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board,
    notes: applicationState.notes,
    users: applicationState.users,
    joinRequests: applicationState.joinRequests,
    votes: applicationState.votes,
    voteConfiguration: applicationState.voteConfiguration,
  }));

  const [downloadURL, setDownloadURL] = useState("");
  const [fileType, setFileType] = useState("");
  let toggleDownload: HTMLAnchorElement | null = null;

  const download = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, type: string) => {
    event.preventDefault();
    if (fileType != type) {
      URL.revokeObjectURL(downloadURL);
      let output = "";
      if (type === "json") {
        output = exportAsJSON(exportState);
        setFileType("json");
      } else if (type === "csv") {
        output = exportAsCSV(exportState);
        setFileType("csv");
      }
      const blob = new Blob([output]);
      const fileDownloadUrl = URL.createObjectURL(blob);
      setDownloadURL(fileDownloadUrl);
    }
  };

  useEffect(() => {
    if (toggleDownload != null && downloadURL != "") {
      toggleDownload.click();
    }
  }, [downloadURL]);

  return (
    <div className="menu__item-button">
      <a style={{display: "none"}} download={`export.${fileType}`} href={downloadURL} ref={(e) => (toggleDownload = e)} />
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
        <button className="menu__item-button" onClick={(event) => download(event, "json")}>
          <ExportIcon className="item-button__icon" />
          <label className="item-button__label">Export as json</label>
        </button>
        <button className="menu__item-button" onClick={(event) => download(event, "csv")}>
          <ExportIcon className="item-button__icon" />
          <label className="item-button__label">Export as csv</label>
        </button>
      </li>
    </div>
  );
};
