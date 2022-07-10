import {ReactElement, useEffect, useRef, useState} from "react";
import {useAppSelector} from "store";
import {API} from "api";
import {Portal} from "components/Portal";
import {useNavigate} from "react-router";
import "./PrintView.scss";
import {useReactToPrint} from "react-to-print";
import {ReactComponent as ScrumlrLogo} from "assets/scrumlr-logo-light.svg";
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

const PrintView = () => {
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const [boardData, setBoardData] = useState<BoardData>();

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const getBoardData = async () => {
    const response = await API.exportBoard(boardId, "application/json");
    return response.json();
  };

  useEffect(() => {
    getBoardData().then((data) => setBoardData(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currDate = new Date();
  const currDateStr = `${String(currDate.getDate()).padStart(2, "0")}.${String(currDate.getMonth() + 1).padStart(2, "0")}.${currDate.getFullYear()}, ${String(
    currDate.getHours()
  ).padStart(2, "0")}:${String(currDate.getMinutes()).padStart(2, "0")}`;

  const getAuthorName = (authorId: string) => (boardData?.board.showAuthors ? boardData?.participants.filter((p) => p.user.id === authorId)[0].user.name : "");

  const getNoteVotes = (noteId: string) => boardData?.votings[0].votes.votesPerNote[noteId]?.total ?? 0;

  const voteLabel = (noteId: string) => {
    if (boardData?.board.showVoting) {
      const votes = getNoteVotes(noteId);
      return votes > 0 ? <div className="print-view__note-info-votes">{votes} Votes</div> : "";
    }
    return "";
  };

  const getChildNotes = (noteId: string) =>
    boardData?.notes
      .filter((n) => n.position.stack === noteId)
      .sort((n) => getNoteVotes(n.id))
      .reverse();

  const noteElement = (id: string, text: string, authorId: string, isChild: boolean, isTop: boolean) => (
    <div key={id} className={classNames("print-view__note", {"print-view__note--isChild": isChild, "print-view__note--isTop": isTop})}>
      <p className="print-view__note-text">{text}</p>
      <div className="print-view__note-info-wrapper">
        <div className="print-view__note-info-author">{getAuthorName(authorId)}</div>
        {voteLabel(id)}
      </div>
    </div>
  );

  const noteStackWrapper = (input: ReactElement, childNotes: {id: string; text: string; author: string}[]) => (
    <div className="print-view__note-stack-wrapper">
      {input}
      <div className="print-view__note-stack-child-wrapper">{childNotes.map((n) => noteElement(n.id, n.text, n.author, true, false))}</div>
    </div>
  );

  return (
    <Portal onClose={() => navigate(`/board/${boardId}`)} className="print-view__portal" disabledPadding>
      <button className="print-view__print-button" onClick={handlePrint}>
        PRINT
      </button>
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
                  .sort((n) => getNoteVotes(n.id))
                  .reverse()
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
            Provided with ♥ by{" "}
            <a href="https://www.inovex.de/" target="_blank" rel="noopener noreferrer">
              inovex
            </a>
          </p>
        </div>
      </div>
    </Portal>
  );
};

export default PrintView;
