import {LoadingScreen} from "components/LoadingScreen";
import {BoardComponent} from "components/Board";
import {Column} from "components/Column";
import {Requests} from "components/Requests";
import store, {useAppSelector} from "store";
import {useEffect} from "react";
import {toast} from "react-toastify";
import {Actions} from "store/action";
import _ from "underscore";
import {Outlet} from "react-router-dom";
import {useDispatch} from "react-redux";
import {OnboardingController} from "components/Onboarding/OnboardingController";

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
        const {onboarding, onboardingNotes} = store.getState();
        sessionStorage.setItem("onboarding_phase", JSON.stringify(onboarding.phase));
        sessionStorage.setItem("onboarding_step", JSON.stringify(onboarding.step));
        sessionStorage.setItem("onboarding_stepOpen", JSON.stringify(onboarding.stepOpen));
        sessionStorage.setItem("onboarding_columns", JSON.stringify(onboarding.onboardingColumns));
        sessionStorage.setItem("onboarding_inUserTask", JSON.stringify(onboarding.inUserTask));
        sessionStorage.setItem("onboarding_fakeVotesOpen", JSON.stringify(onboarding.fakeVotesOpen));
        sessionStorage.setItem("onboarding_spawnedActionNotes", JSON.stringify(onboarding.spawnedActionNotes));
        sessionStorage.setItem("onboarding_spawnedBoardNotes", JSON.stringify(onboarding.spawnedBoardNotes));
        sessionStorage.setItem("onboardingNotes", JSON.stringify(onboardingNotes));
        store.dispatch(Actions.leaveBoard());
      },
      false
    );

    window.addEventListener(
      "onunload",
      () => {
        const {onboarding, onboardingNotes} = store.getState();
        sessionStorage.setItem("onboarding_phase", JSON.stringify(onboarding.phase));
        sessionStorage.setItem("onboarding_step", JSON.stringify(onboarding.step));
        sessionStorage.setItem("onboarding_stepOpen", JSON.stringify(onboarding.stepOpen));
        sessionStorage.setItem("onboarding_columns", JSON.stringify(onboarding.onboardingColumns));
        sessionStorage.setItem("onboarding_inUserTask", JSON.stringify(onboarding.inUserTask));
        sessionStorage.setItem("onboarding_fakeVotesOpen", JSON.stringify(onboarding.fakeVotesOpen));
        sessionStorage.setItem("onboardingNotes", JSON.stringify(onboardingNotes));
        sessionStorage.setItem("onboarding_spawnedActionNotes", JSON.stringify(onboarding.spawnedActionNotes));
        sessionStorage.setItem("onboarding_spawnedBoardNotes", JSON.stringify(onboarding.spawnedBoardNotes));
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

  const dispatch = useDispatch();
  const isOnboarding = window.location.pathname.startsWith("/onboarding");
  if (!isOnboarding) {
    dispatch(Actions.changePhase("none"));
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
        {isOnboarding && <OnboardingController />}
      </>
    );
  }
  return <LoadingScreen />;
};
