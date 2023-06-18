// import { useTranslation } from "react-i18next";
import store, {useAppSelector} from "store";
import {isEqual} from "underscore";
import {OnboardingController} from "components/Onboarding/OnboardingController";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {ReactComponent as NewScrumMaster} from "assets/onboarding/onboarding_intro.svg";
import {ReactComponent as StanMentor} from "assets/stan/Stan_coffee_bluepen_lightmode.svg";
import "./OnboardingIntro.scss";
import {useEffect} from "react";
import {AvatarSettings} from "components/SettingsDialog/Components/AvatarSettings";

export const OnboardingIntro = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  let introImage;
  let title;
  let content;
  const state = useAppSelector((applicationState) => ({
    user: applicationState.auth.user!,
  }));

  useEffect(() => {
    if (phase === "intro" && step === 1) {
      store.dispatch(Actions.setParticipants([{user: state.user, connected: true, raisedHand: false, showHiddenColumns: true, ready: false, role: "OWNER"}]));
    }
    if (phase === "newBoard") {
      navigate("/onboarding-new");
    }
  }, [phase, navigate, step, state.user]);

  if (phase === "intro" && step === 1) {
    introImage = <NewScrumMaster />;
    title = "Meet Mike!";
    content = "Mike, our newbie Scrum-Master has a problem. \n He just got tasked with organizing his first retrospective but he feels a bit overwhelmed . . .";
  } else if (phase === "intro" && step === 2) {
    content = "Luckily, he has competent mentors like you and our beloved sloth Stan.";
    title = "To the Rescue!";
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
      {phase === "intro" && step === 1 && (
        <div className="onboarding-intro-container">
          <div className="onboarding-intro-hero">{introImage}</div>
          <h2 className="onboarding-intro-title">{title}</h2>
          <div className="onboarding-intro-content">
            <p>{content}</p>
          </div>
        </div>
      )}
      {phase === "intro" && step === 2 && (
        <div className="onboarding-intro-container">
          <div className="onboarding-intro-mentors">
            <div className="onboarding-intro-avatar">
              <AvatarSettings id={state.user.id} />
            </div>
            <div className="onboarding-intro-stan">
              <StanMentor />
            </div>
          </div>
          <h2 className="onboarding-intro-title">{title}</h2>
          <div className="onboarding-intro-content">
            <p>{content}</p>
          </div>
        </div>
      )}
      <OnboardingController />
    </div>
  );
};
