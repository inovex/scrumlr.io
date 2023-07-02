import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg";
import {Actions} from "store/action";
import "./OnboardingPathModal.scss";
// TODO: unify OnboardingPathModal and OnboardingModalOutro components

export const OnboardingPathModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="onboarding-path-modal">
      <button
        className="onboarding-path-modal__close"
        onClick={() => {
          dispatch(Actions.toggleStepOpen());
        }}
      >
        <CloseIcon className="close-button__icon" />
      </button>
      <div className="onboarding-path-modal__title">
        <h2>Onboarding</h2>
      </div>
      <div className="onboarding-path-modal__content">
        <div className="onboarding-path-modal__text">
          {"Great to have you here! \nLet's start your journey into the world of retrospectives and Scrumlr! \nChoose your onboarding path:"}
        </div>
        <div className="onboarding-buttons">
          <button className="button onboarding-path__participant" disabled>
            Participant
          </button>
          <button
            className="button onboarding-path__moderator"
            onClick={() => {
              dispatch(Actions.changePhase("intro"));
              navigate("/onboarding-intro");
            }}
          >
            Moderator
          </button>
        </div>
      </div>
      <div className="onboarding-path-modal__img">
        <StanIcon />
      </div>
    </div>
  );
};
