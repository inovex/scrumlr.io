import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Requests} from "components/Requests";
import store, {useAppSelector} from "store";
import {InfoBar} from "components/Infobar";
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
  const visibleColumns = state.columns.filter((column) => column.visible || (currentUserIsModerator && state.participants?.self.showHiddenColumns));

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
        <InfoBar />
        <Outlet />
        <BoardComponent currentUserIsModerator={currentUserIsModerator} moderating={state.view.moderating}>
          {visibleColumns.map((column, index) => (
            <Column
              key={column.id}
              id={column.id}
              index={column.index}
              name={column.name}
              visible={column.visible}
              color={column.color}
              isFirst={index === 0}
              isLast={index === visibleColumns.length - 1}
            />
          ))}
        </BoardComponent>
      </>
    );
  }
  return <LoadingScreen />;
};
