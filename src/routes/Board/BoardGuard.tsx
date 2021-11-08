import {useEffect} from "react";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {LoadingIndicator} from "components/LoadingIndicator";
import {PassphraseDialog} from "components/PassphraseDialog";
import {useParams} from "react-router";
import {Board} from "./Board";
import "./BoardGuard.scss";

export const BoardGuard = () => {
  const {boardId} = useParams<"boardId">();

  const boardStatus = useAppSelector((state) => state.board.status);

  useEffect(() => {
    store.dispatch(ActionFactory.joinBoard(boardId!));

    return () => {
      store.dispatch(ActionFactory.leaveBoard());
    };
  }, [boardId]);

  if (boardStatus === "accepted" || boardStatus === "ready") {
    return <Board />;
  }

  if (boardStatus === "passphrase_required") {
    return (
      <PassphraseDialog
        onSubmit={(passphrase: string) => {
          store.dispatch(ActionFactory.joinBoard(boardId!, passphrase));
        }}
      />
    );
  }

  if (boardStatus === "incorrect_passphrase") {
    return (
      <div className="board-guard">
        <p className="board-guard__info">Incorrect passphrase used.</p>
        <a href="/" className="board-guard__denied-link">
          Return to homepage
        </a>
      </div>
    );
  }

  if (boardStatus === "rejected") {
    return (
      <div className="board-guard">
        <p className="board-guard__info">You have been rejected.</p>
        <a href="/" className="board-guard__denied-link">
          Return to homepage
        </a>
      </div>
    );
  }

  // TODO add PassphraseDialog here if password is enabled
  return (
    <div className="board-guard">
      <LoadingIndicator />
      <p className="board-guard__info">Waiting for approval.</p>
    </div>
  );
};
