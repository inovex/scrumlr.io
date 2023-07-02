import {UserAvatar} from "components/BoardUsers";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {Actions} from "store/action";
import {onboardingAuthors} from "types/onboardingNotes";
import "./OnboardingModalOutro.scss";

export const OnboardingModalOutro = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mikeAvatar = onboardingAuthors.find((oa) => oa.user.name === "Mike")?.user.avatar;

  const onboardingCleanup = () => {
    dispatch(Actions.changePhase("none"));
    dispatch(Actions.clearOnboardingNotes());
    dispatch(Actions.clearOnboardingColumns());
    dispatch(Actions.setSpawnedNotes("action", false));
    dispatch(Actions.setSpawnedNotes("board", false));
    dispatch(Actions.setInUserTask(false));
    dispatch(Actions.setFakeVotesOpen(false));

    sessionStorage.setItem("onboarding_phase", JSON.stringify("none"));
    sessionStorage.setItem("onboarding_step", JSON.stringify(1));
    sessionStorage.setItem("onboarding_stepOpen", JSON.stringify(false));
    sessionStorage.setItem("onboarding_columns", JSON.stringify([]));
    sessionStorage.setItem("onboarding_inUserTask", JSON.stringify(false));
    sessionStorage.setItem("onboarding_fakeVotesOpen", JSON.stringify(false));
    sessionStorage.setItem("onboarding_spawnedActionNotes", JSON.stringify(false));
    sessionStorage.setItem("onboarding_spawnedBoardNotes", JSON.stringify(false));
    sessionStorage.setItem("onboardingNotes", JSON.stringify([]));
  };

  return (
    <div className="floater onboarding-modal-outro">
      <div className="onboarding-modal-outro__title">
        <h2>Thank you for your help!</h2>
      </div>
      <div className="onboarding-modal-outro__content">
        <p className="onboarding-modal-outro__text">
          {"You were a great help during this retro! \nThanks to you it was a success.\nI will do my best on my own in the next sessions!"}
        </p>
        <div className="onboarding-modal-outro__buttons">
          <button
            className="button onboarding-button_home"
            onClick={() => {
              onboardingCleanup();
              navigate("/");
            }}
          >
            Homepage
          </button>
          <button
            className="button onboarding-button_newBoard"
            onClick={() => {
              onboardingCleanup();
              navigate("/new");
            }}
          >
            Create Board !
          </button>
          <button className="button onboarding-button_stay" onClick={() => dispatch(Actions.toggleStepOpen())}>
            Stay here.
          </button>
        </div>
      </div>
      <div className="onboarding-modal-outro__img">{mikeAvatar && <UserAvatar title="Mike" id="onboarding-Mike" avatar={mikeAvatar} />}</div>
    </div>
  );
};
