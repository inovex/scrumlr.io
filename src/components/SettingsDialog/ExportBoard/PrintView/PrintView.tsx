import {useEffect, useRef, useState} from "react";
import {useAppSelector} from "store";
import {API} from "api";
import {Portal} from "components/Portal";
import {useNavigate} from "react-router";
import "./PrintView.scss";
import {useReactToPrint} from "react-to-print";

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
}

const PrintView = () => {
  const boardId = useAppSelector((applicationState) => applicationState.board.data!.id);
  const [boardData, setBoardData] = useState<BoardData>();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const getBoardData = async () => {
    const response = await API.exportBoard(boardId, "application/json");
    const json = await response.json();
    setBoardData(json);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useEffect(() => {
    getBoardData();
  }, []);

  return (
    <Portal onClose={() => navigate(`/board/${boardId}`)} className="print-view__portal" disabledPadding>
      <button onClick={handlePrint}>PRINT</button>
      <div ref={printRef} className="print-view__container">
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
