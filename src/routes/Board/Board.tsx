import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Request} from "components/Request";
import store, {useAppSelector} from "store";
import {InfoBar} from "components/Infobar";
import {TabIndex} from "constants/tabIndex";
import {useEffect} from "react";
import {toast} from "react-toastify";
import {Actions} from "store/action";
import _ from "underscore";

export const Board = () => {
  useEffect(
    () => () => {
      toast.clearWaitingQueue();
      toast.dismiss();
    },
    []
  );

  useEffect(() => {
    window.addEventListener(
      "beforeunload",
      () => {
        store.dispatch(Actions.leaveBoard());
      },
      false
    );

    window.addEventListener(
      "onunload",
      () => {
        store.dispatch(Actions.leaveBoard());
      },
      false
    );
  }, []);

  const state = useAppSelector(
    (applicationState) => ({
      board: {
        id: applicationState.board.data?.id,
        status: applicationState.board.status,
      },
      columns: applicationState.columns,
      requests: applicationState.requests,
      participants: applicationState.participants,
      auth: applicationState.auth,
    }),
    _.isEqual
  );

  const currentUserIsModerator = state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR";

  if (state.board.status === "pending") {
    return <LoadingScreen />;
  }

  if (state.board.status === "ready") {
    return (
      <>
        {currentUserIsModerator && (
          <Request
            requests={state.requests.filter((request) => request.status === "PENDING")}
            participantsWithRaisedHand={state.participants!.participants.filter((p) => p.raisedHand)}
          />
        )}
        <InfoBar />
        <BoardComponent currentUserIsModerator={currentUserIsModerator}>
          {state.columns
            .filter((column) => column.visible || (currentUserIsModerator && state.participants?.self.showHiddenColumns))
            .map((column, columnIndex) => (
              <Column tabIndex={TabIndex.Column + columnIndex} key={column.id} id={column.id} name={column.name} hidden={!column.visible} color={column.color} />
            ))}
        </BoardComponent>
      </>
    );
  }
  return <LoadingScreen />;
};
