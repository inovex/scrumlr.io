import {ReactElement, useEffect, useRef, useState} from "react";
import {API} from "api";
import {useNavigate} from "react-router";
import "./PrintView.scss";
import {useReactToPrint} from "react-to-print";
import {ReactComponent as ScrumlrLogo} from "assets/scrumlr-logo-light.svg";
import {ReactComponent as PrintIcon} from "assets/icon-print.svg";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";

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
      color: Color;
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

interface PrintViewProps {
  boardId: string;
  boardName: string;
}

export const PrintView = ({boardId, boardName}: PrintViewProps) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [boardData, setBoardData] = useState<BoardData>();

  const pageStyle = `
      @page {
        size: A4;

      }
    `;

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: boardName ?? "scrumlr.io",
    pageStyle,
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
        <span className="print-view__note-info-author">{getAuthorName(authorId)}</span>
        <span className={classNames({"print-view__note-info--isTop": isTop, "print-view__note-info--isChild": isChild})}>{voteLabel(id)}</span>
      </div>
    </div>
  );

  const noteStackWrapper = (input: ReactElement, childNotes: {id: string; text: string; author: string}[]) => (
    <div className="print-view__note-stack-wrapper">
      {input}
      <div className="print-view__note-stack-child-wrapper">{childNotes.map((n) => noteElement(n.id, n.text, n.author, true, false))}</div>
    </div>
  );

  const columnHasNotes = (columnId: string) => columnId && !!boardData?.notes.filter((n) => n.position.column === columnId).length;

  const handleClose = () => navigate(`/board/${boardId}`);

  return (
    <div className="print-view__container">
      <div className="print-view__button-container">
        <button className="print-view__button" onClick={handlePrint}>
          <PrintIcon className="print-view__icon-print" />
        </button>
        <button className="print-view__button" onClick={handleClose}>
          <CloseIcon className="print-view__icon-close" />
        </button>
      </div>
      <div ref={printRef} className="print-view">
        <div className="print-view__title-wrapper">
          <ScrumlrLogo />
          <h1 className="print-view__title-text">{boardData?.board.name ?? "scrumlr.io"}</h1>
          <div className="print-view__title-info">
            <p>{currDateStr}</p>
            <p>{`${boardData?.participants.length} ${t("PrintView.Participants")}`}</p>
          </div>
        </div>
        <div className="print-view__column-list">
          {boardData &&
            boardData.columns?.map(
              (c) =>
                columnHasNotes(c.id) && (
                  <div key={c.id} className={classNames("print-view__column", getColorClassName(c.color))}>
                    <div className="print-view__column-header-wrapper">
                      <h2 className="print-view__column-header-text">{c.name}</h2>
                      <div className="print-view__column-header-card-count">
                        {boardData.notes.filter((n) => n.position.column === c.id).length} {t("PrintView.Notes")}
                      </div>
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
                )
            )}
        </div>
        <div className="print-view__footer-container">
          <p>
            {t("PrintView.GeneratedOn")}{" "}
            <a href="https://scrumlr.io/" target="_blank" rel="noopener noreferrer">
              scrumlr.io
            </a>
          </p>
          <p>
            {t("PrintView.ProvidedBy")}{" "}
            <a href="https://www.inovex.de/" target="_blank" rel="noopener noreferrer">
              inovex
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
