import {useEffect} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {LoadingIndicator} from "components/LoadingIndicator";
import "./BoardGuard.scss";
import {PassphraseDialog} from "components/PassphraseDialog";
import {useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {PrintView} from "components/SettingsDialog/ExportBoard/PrintView";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";
import {RejectionPage} from "components/RejectionPage";
import {Board} from "./Board";

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
          store.dispatch(Actions.joinBoard(boardId!, passphrase));
        }}
        incorrectPassphrase={boardStatus === "incorrect_passphrase"}
      />
    );
  }

  if (boardStatus === "rejected" || boardStatus === "too_many_join_requests") {
    return <RejectionPage />;
  }

  return (
    <div className="board-guard">
      <LoadingIndicator />
      <p className="board-guard__info">{t("BoardGuard.waitingForApproval")}</p>
    </div>
  );
};
