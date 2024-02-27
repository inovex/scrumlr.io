import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Requests} from "components/Requests";
import {BoardReactionContainer} from "components/BoardReactionContainer/BoardReactionContainer";
import store, {useAppSelector} from "store";
import {useEffect} from "react";
import {toast} from "react-toastify";
import {Actions} from "store/action";
import _ from "underscore";
import {Outlet} from "react-router-dom";

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
      view: applicationState.view,
    }),
    _.isEqual
  );

  const currentUserIsModerator = state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR";

  if (state.participants?.self.banned) {
    window.location.reload();
    return <LoadingScreen />; // fallback
  }

  if (state.board.status === "pending") {
    return <LoadingScreen />;
  }

  if (state.board.status === "ready") {
    return (
      <>
        {currentUserIsModerator && (
          <Requests
            requests={state.requests.filter((request) => request.status === "PENDING")}
            participantsWithRaisedHand={state.participants!.others.filter((p) => p.raisedHand)}
          />
        )}
        <Outlet />
        <BoardComponent currentUserIsModerator={currentUserIsModerator} moderating={state.view.moderating}>
          {state.columns
            .filter((column) => column.visible || (currentUserIsModerator && state.participants?.self.showHiddenColumns))
            .map((column) => (
              <Column key={column.id} id={column.id} index={column.index} name={column.name} visible={column.visible} color={column.color} />
            ))}
        </BoardComponent>
        <BoardReactionContainer />
      </>
    );
  }
  return <LoadingScreen />;
};
