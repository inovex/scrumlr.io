import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Requests} from "components/Requests";
import {BoardReactionContainer} from "components/BoardReactionContainer/BoardReactionContainer";
import {useAppDispatch, useAppSelector} from "store";
import {useEffect} from "react";
import {toast} from "react-toastify";
import _ from "underscore";
import {Outlet} from "react-router";
import {leaveBoard} from "store/features";
import {SnowfallWrapper} from "components/SnowfallWrapper/SnowfallWrapper";

export const Board = () => {
  const dispatch = useAppDispatch();

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
        dispatch(leaveBoard());
      },
      false
    );

    window.addEventListener(
      "onunload",
      () => {
        dispatch(leaveBoard());
      },
      false
    );
  }, [dispatch]);

  const state = useAppSelector(
    (applicationState) => ({
      board: {
        id: applicationState.board.data?.id,
        status: applicationState.board.status,
        locked: applicationState.board.data?.isLocked,
      },
      columns: applicationState.columns,
      requests: applicationState.requests,
      participants: applicationState.participants,
      auth: applicationState.auth,
      view: applicationState.view,
    }),
    _.isEqual
  );

  const currentUserIsModerator = state.participants?.self?.role === "OWNER" || state.participants?.self?.role === "MODERATOR";

  if (state.participants?.self?.banned) {
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
            participantsWithRaisedHand={(state.participants!.others ?? []).filter((p) => p.raisedHand)}
          />
        )}
        <SnowfallWrapper />
        <Outlet />
        <BoardComponent currentUserIsModerator={currentUserIsModerator} moderating={state.view.moderating} locked={!!state.board.locked}>
          {state.columns
            .filter((column) => column.visible || (currentUserIsModerator && state.participants?.self?.showHiddenColumns))
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
