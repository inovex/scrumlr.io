import {useEffect} from "react";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {RouteComponentProps} from "react-router";
import {LoadingIndicator} from "components/LoadingIndicator";
import {Board} from "./Board";
import "./BoardGuard.scss";
import {PassphraseDialog} from "components/PassphraseDialog";

export type BoardGuardProps = RouteComponentProps<{id: string}>;

export const BoardGuard = (props: BoardGuardProps) => {
  const boardStatus = useAppSelector((state) => state.board.status);
  const boardId = props.match.params.id;

  useEffect(() => {
    store.dispatch(ActionFactory.joinBoard(boardId));

    return () => {
      store.dispatch(ActionFactory.leaveBoard());
    };
  }, [props.match.params.id]);

  if (boardStatus === "accepted" || boardStatus === "ready") {
    return <Board />;
  }

  if (boardStatus === "passphrase_required") {
    return (
      <PassphraseDialog
        onSubmit={(passphrase: string) => {
          store.dispatch(ActionFactory.joinBoard(boardId, passphrase));
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
