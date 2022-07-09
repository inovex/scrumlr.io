import {useEffect, useRef, useState} from "react";
import {useAppSelector} from "store";
import {API} from "api";
import {Portal} from "components/Portal";
import {useNavigate} from "react-router";
import "./PrintView.scss";
import {useReactToPrint} from "react-to-print";
import {ReactComponent as ScrumlrLogo} from "assets/scrumlr-logo-light.svg";
import {useTranslation} from "react-i18next";

interface BoardData {
  board: {
    id: string;
    name: string;
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
      position: {
        column: string;
      };
    }
  ];
  participants: [
    {
      role: string;
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
    const json = await response.json();
    setBoardData(json);
  };
  console.log(boardData);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useEffect(() => {
    getBoardData();
  }, []);

  const currDate = new Date();
  const currDateStr = `${String(currDate.getDate()).padStart(2, "0")}.${String(currDate.getMonth() + 1).padStart(2, "0")}.${currDate.getFullYear()}, ${String(
    currDate.getHours()
  ).padStart(2, "0")}:${String(currDate.getMinutes()).padStart(2, "0")}`;

  return (
    <Portal onClose={() => navigate(`/board/${boardId}`)} className="print-view__portal" disabledPadding>
      <button onClick={handlePrint}>PRINT</button>
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
                  .map((n) => (
                    <div key={n.id} className="print-view__note">
                      {n.text}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </div>
    </Portal>
  );
};

export default PrintView;
