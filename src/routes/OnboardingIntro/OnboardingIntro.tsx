// import { useTranslation } from "react-i18next";
import {useAppSelector} from "store";
import {isEqual} from "underscore";
import {OnboardingController} from "components/Onboarding/OnboardingController";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./OnboardingIntro.scss";

export const OnboardingIntro = () => {
  // const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  let content;
  let introImage;

  if (phase === "newBoard") {
    navigate("/onboarding-new");
  }

  if (step === 1) {
    content = "Step 1 is about the company sloth inc. Things shoud be peaceful, but...";
    introImage = <img src="" alt="onboarding img 1" />;
  } else if (step === 2) {
    content = "Step 2 is about the conflict. Due to insufficient communication and missing retrospectives, the mood is down";
    introImage = <img src="" alt="onboarding img 2" />;
  } else {
    content = "Step 3 is about hope. With your help and Scrumlr, the team might be able to reach new heights and reconcile.";
    introImage = <img src="" alt="onboarding img 3" />;
  }

  return (
    <div className="onboarding-intro-wrapper">
      <Link
        to="/"
        onClick={() => {
          dispatch(Actions.changePhase("none"));
        }}
      >
        <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      </Link>
      <div className="onboarding-intro-container">
        <div className="onboarding-intro-hero">{introImage}</div>
        <div className="onboarding-intro-content">
          <p>{content}</p>
        </div>
      </div>
      <OnboardingController />
    </div>
  );
};
