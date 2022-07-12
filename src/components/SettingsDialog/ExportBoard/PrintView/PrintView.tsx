import {ReactElement, useEffect, useRef, useState} from "react";
import {useAppSelector} from "store";
import {API} from "api";
import {Portal} from "components/Portal";
import {useNavigate} from "react-router";
import "./PrintView.scss";
import {useReactToPrint} from "react-to-print";
import {ReactComponent as ScrumlrLogo} from "assets/scrumlr-logo-light.svg";
import {ReactComponent as PrintIcon} from "assets/icon-print.svg";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as StackIcon} from "assets/icon-unstack.svg";
import {useTranslation} from "react-i18next";
import classNames from "classnames";

interface BoardData {
  board: {
    id: string;
    name: string;
    showAuthors: boolean;
    showVoting: boolean;
  };
  columns: [
    {
      id: string;
      name: string;
    }
  ];
  notes: [
    {
      id: string;
      author: string;
      text: string;
      votes: number;
      position: {
        column: string;
        stack: string;
        rank: number;
      };
    }
  ];
  participants: [
    {
      role: string;
      user: {
        id: string;
        name: string;
      };
    }
  ];
  votings: [
    {
      votes: {
        votes: number;
        votesPerNote: [];
      };
    }
  ];
}

export const PrintView = () => {
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);
  const boardName = useAppSelector((applicationState) => applicationState.board.data!.name);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const [boardData, setBoardData] = useState<BoardData>();

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: boardName ?? "scrumlr.io",
  });

  const getBoardData = async () => {
    const response = await API.exportBoard(boardId, "application/json");
    return response.json();
  };

  useEffect(() => {
    if (!boardData) {
      getBoardData()
        .then((data) => setBoardData(data))
        .then(handlePrint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currDate = new Date();
  const currDateStr = `${String(currDate.getDate()).padStart(2, "0")}.${String(currDate.getMonth() + 1).padStart(2, "0")}.${currDate.getFullYear()}, ${String(
    currDate.getHours()
  ).padStart(2, "0")}:${String(currDate.getMinutes()).padStart(2, "0")}`;

  const getAuthorName = (authorId: string) => (boardData?.board.showAuthors ? boardData?.participants.filter((p) => p.user?.id === authorId)[0].user?.name : "");

  const getNoteVotes = (noteId: string) => (boardData?.votings ? boardData?.votings[0].votes?.votesPerNote[noteId]?.total ?? 0 : 0);

  const voteLabel = (noteId: string) => {
    if (!(boardData?.votings && boardData?.board.showVoting)) return "";
    const votes = getNoteVotes(noteId);
    return votes > 0 ? <div className="print-view__note-info-votes">{votes} Votes</div> : "";
  };

  const compareNotes = (a: {id: string; position: {rank: number}}, b: {id: string; position: {rank: number}}) => {
    if (boardData?.votings && getNoteVotes(a.id) !== getNoteVotes(b.id)) {
      return getNoteVotes(a.id) > getNoteVotes(b.id) ? -1 : 1;
    }
    return a.position.rank > b.position.rank ? -1 : 1;
  };

  const getChildNotes = (noteId: string) => boardData?.notes.filter((n) => n.position.stack === noteId).sort((a, b) => compareNotes(a, b));

  const noteElement = (id: string, text: string, authorId: string, isChild: boolean, isTop: boolean) => (
    <div key={id} className={classNames("print-view__note", {"print-view__note--isChild": isChild, "print-view__note--isTop": isTop})}>
      <p className="print-view__note-text">{text}</p>
      <div className="print-view__note-info-wrapper">
        <div className="print-view__note-info-author">{getAuthorName(authorId)}</div>
        <div className={classNames({"print-view__note-info--isTop": isTop, "print-view__note-info--isChild": isChild})}>
          {(isTop || isChild) && <StackIcon />}
          {voteLabel(id)}
        </div>
      </div>
    </div>
  );

  const noteStackWrapper = (input: ReactElement, childNotes: {id: string; text: string; author: string}[]) => (
    <div className="print-view__note-stack-wrapper">
      {input}
      <div className="print-view__note-stack-child-wrapper">{childNotes.map((n) => noteElement(n.id, n.text, n.author, true, false))}</div>
    </div>
  );

  const handleClose = () => navigate(`/board/${boardId}`);

  return (
    <Portal onClose={handleClose} className="print-view__portal" disabledPadding>
      <div className="print-view__button-container">
        <button className="print-view__button" onClick={handlePrint}>
          <PrintIcon className="print-view__icon-print" />
        </button>
        <button className="print-view__button" onClick={handleClose}>
          <CloseIcon className="print-view__icon-close" />
        </button>
      </div>
      <div ref={printRef} className="print-view__container">
        <div className="print-view__title-wrapper">
          <ScrumlrLogo />
          <h1 className="print-view__title-text">{boardData?.board.name ?? "Scrumlr.io"}</h1>
          <div className="print-view__title-info">
            <div className="print-view__title-date">{currDateStr}</div>
            <div className="print-view__title-participant-count">{`${boardData?.participants.length} ${t("SettingsDialog.Participants")}`}</div>
          </div>
        </div>
        <div className="print-view__column-list">
          {boardData &&
            boardData.columns?.map((c) => (
              <div key={c.id} className="print-view__column">
                <div className="print-view__column-header-wrapper">
                  <h2 className="print-view__column-header-text">{c.name}</h2>
                  <div className="print-view__column-header-card-count">{boardData.notes.filter((n) => n.position.column === c.id).length} cards</div>
                </div>
                {boardData.notes
                  .filter((n) => n.position.column === c.id)
                  .sort((a, b) => compareNotes(a, b))
                  .map((n) => {
                    if (!n.position.stack) {
                      const childNotes = getChildNotes(n.id);
                      return childNotes && childNotes.length > 0
                        ? noteStackWrapper(noteElement(n.id, n.text, n.author, false, true), childNotes)
                        : noteElement(n.id, n.text, n.author, false, false);
                    }
                    return "";
                  })}
              </div>
            ))}
        </div>
        <div className="print-view__footer-container">
          <p>
            Generated on{" "}
            <a href="https://scrumlr.io/" target="_blank" rel="noopener noreferrer">
              scrumlr.io
            </a>
          </p>
          <p>
            Provided with ♥️ by{" "}
            <a href="https://www.inovex.de/" target="_blank" rel="noopener noreferrer">
              inovex
            </a>
          </p>
        </div>
      </div>
    </Portal>
  );
};
