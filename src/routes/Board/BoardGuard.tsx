import {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useParams} from "react-router";
import {LoadingIndicator} from "components/LoadingIndicator";
import {PassphraseDialog} from "components/PassphraseDialog";
import {PrintView} from "components/SettingsDialog/ExportBoard/PrintView";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";
import {RejectionPage} from "components/RejectionPage";
import {LoadingScreen} from "components/LoadingScreen";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {Board} from "./Board";
import "./BoardGuard.scss";

interface BoardGuardProps {
  printViewEnabled: boolean;
}

export const BoardGuard = ({printViewEnabled}: BoardGuardProps) => {
  const {boardId} = useParams<"boardId">();
  const {t} = useTranslation();

  const boardStatus = useAppSelector((state) => state.board.status);
  const boardName = useAppSelector((applicationState) => applicationState.board.data?.name);

  useEffect(() => {
    store.dispatch(Actions.joinBoard(boardId!));

    return () => {
      store.dispatch(Actions.leaveBoard());
    };
  }, [boardId]);

  if (printViewEnabled && boardId) {
    return <PrintView boardId={boardId} boardName={boardName ?? "scrumlr.io"} />;
  }

  if (boardStatus === "pending" || boardStatus === "accepted") {
    return <LoadingScreen />;
  }

  if (boardStatus === "ready") {
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
          store.dispatch(Actions.joinBoard(boardId!, passphrase));
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
