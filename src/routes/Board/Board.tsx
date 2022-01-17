import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Request} from "components/Request";
import store, {useAppSelector} from "store";
import {InfoBar} from "components/Infobar";
import {TabIndex} from "constants/tabIndex";
import Parse from "parse";
import {useEffect} from "react";
import {toast} from "react-toastify";
import {ActionFactory} from "store/action";
import _ from "underscore";

export const Board = () => {
  useEffect(
    () => () => {
      toast.clearWaitingQueue();
      toast.dismiss();
    },
    []
  );

  const leaveBorad = () => {
    store.dispatch(ActionFactory.leaveBoard());
  };

  useEffect(() => {
    window.addEventListener("beforeunload", leaveBorad);

    window.addEventListener("onunload", leaveBorad);

    return () => {
      window.removeEventListener("beforeunload", leaveBorad);
      window.removeEventListener("onunload", leaveBorad);
    };
  }, []);

  const state = useAppSelector(
    (applicationState) => ({
      board: {
        id: applicationState.board.data?.id,
        columns: applicationState.board.data?.columns,
        status: applicationState.board.status,
      },
      joinRequests: applicationState.joinRequests,
      users: applicationState.users,
      userConfiguration: applicationState.board.data?.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id),
    }),
    _.isEqual
  );

  const currentUserIsModerator = state.users.admins.find((user) => user.id === Parse.User.current()!.id) !== undefined;

  if (state.board.status === "pending") {
    return <LoadingScreen />;
  }

  if (state.board.status === "ready") {
    return (
      <>
        {currentUserIsModerator && (
          <Request
            joinRequests={state.joinRequests.filter((joinRequest) => joinRequest.status === "pending")}
            users={state.users.all}
            raisedHands={state.users.usersRaisedHands.filter((id) => id !== Parse.User.current()?.id)}
            boardId={state.board.id!}
          />
        )}
        <InfoBar />
        <BoardComponent currentUserIsModerator={currentUserIsModerator}>
          {state.board
            .columns!.filter((column) => !column.hidden || (currentUserIsModerator && state.userConfiguration?.showHiddenColumns))
            .map((column, columnIndex) => (
              <Column
                tabIndex={TabIndex.Column + columnIndex}
                key={column.columnId}
                id={column.columnId!}
                name={column.name}
                hidden={column.hidden}
                currentUserIsModerator={currentUserIsModerator}
                color={column.color}
              />
            ))}
        </BoardComponent>
      </>
    );
  }
  return <LoadingScreen />;
};
