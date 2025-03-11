import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {LoadingIndicator} from "components/LoadingIndicator";
import "./BoardGuard.scss";
import {PassphraseDialog} from "components/PassphraseDialog";
import {useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {PrintView} from "components/SettingsDialog/ExportBoard/PrintView";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";
import {RejectionPage} from "components/RejectionPage";
import {joinBoard, leaveBoard} from "store/features";
import {Board} from "./Board";

interface BoardGuardProps {
  printViewEnabled: boolean;
}

export const BoardGuard = ({printViewEnabled}: BoardGuardProps) => {
  const dispatch = useAppDispatch();
  const {boardId} = useParams<"boardId">(); // TODO: wie funktioniert useParams? hier kommt die BoardId her die dann undefined ist wenn sie joinBoard called durch die Auswahl einer Session zum öffnen
  const {t} = useTranslation();
  console.log("boardId in BoardGuard: ", boardId);

  const boardStatus = useAppSelector((state) => state.board.status);
  const boardName = useAppSelector((applicationState) => applicationState.board.data?.name);
  console.log("boardstatus in BoardGuard: ", boardStatus); // TODO: alles undefined
  console.log("boardname in BoardGuard: ", boardName);

  useEffect(() => {
    console.log("boardguard.tsx calling joinboard in request/thunks with boardid: ", boardId);
    dispatch(joinBoard({boardId: boardId!}));

    return () => {
      dispatch(leaveBoard());
    };
  }, [boardId, dispatch]);

  if (printViewEnabled && boardId) {
    return <PrintView boardId={boardId} boardName={boardName ?? "scrumlr.io"} />;
  }

  if (boardStatus === "accepted" || boardStatus === "ready") {
    return (
      <CustomDndContext>
        <Board />
      </CustomDndContext>
    );
  }

  if (boardStatus === "passphrase_required" || boardStatus === "incorrect_passphrase") {
    return (
      <PassphraseDialog
        onSubmit={(passphrase: string) => {
          dispatch(joinBoard({boardId: boardId!, passphrase}));
        }}
        incorrectPassphrase={boardStatus === "incorrect_passphrase"}
      />
    );
  }

  if (boardStatus === "rejected" || boardStatus === "too_many_join_requests" || boardStatus === "banned") {
    return <RejectionPage status={boardStatus} />;
  }

  return (
    <div className="board-guard">
      <LoadingIndicator />
      <p className="board-guard__info">{t("BoardGuard.waitingForApproval")}</p>
    </div>
  );
};
