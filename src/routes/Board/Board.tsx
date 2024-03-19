import {useEffect} from "react";
import {toast} from "react-toastify";
import {Outlet} from "react-router-dom";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Requests} from "components/Requests";
import {BoardReactionContainer} from "components/BoardReactionContainer/BoardReactionContainer";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {hasModerationPermissions} from "store/selectors";

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

  const clientIsModerator = useAppSelector(hasModerationPermissions);
  const clientIsPresenting = useAppSelector((state) => state.view.moderating);
  const hiddenColumnsDisplayed = useAppSelector((state) => state.participants?.self.showHiddenColumns);
  const raisedHandParticpants = useAppSelector((state) => state.participants?.others.filter((participant) => participant.raisedHand)) ?? [];
  const pendingJoinRequests = useAppSelector((state) => state.requests.filter((request) => request.status === "PENDING"));
  const visibleColums = useAppSelector((state) => state.columns.filter((column) => column.visible || (clientIsModerator && hiddenColumnsDisplayed)));

  return (
    <>
      {clientIsModerator && <Requests requests={pendingJoinRequests} participantsWithRaisedHand={raisedHandParticpants} />}
      <Outlet />
      <BoardComponent currentUserIsModerator={clientIsModerator} moderating={clientIsPresenting}>
        {visibleColums.map((column) => (
          <Column id={column.id} />
        ))}
      </BoardComponent>
      <BoardReactionContainer />
    </>
  );
};
