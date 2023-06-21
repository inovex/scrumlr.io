// import { useTranslation } from "react-i18next";
import store, {useAppSelector} from "store";
import {isEqual} from "underscore";
import {OnboardingController} from "components/Onboarding/OnboardingController";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {ReactComponent as NewScrumMaster} from "assets/onboarding/Intro-2.svg";
import {ReactComponent as StanMentor} from "assets/stan/Scruml_Stan_coffe_shirtdarkblue.svg";
import "./OnboardingIntro.scss";
import {useEffect, useState} from "react";
import {AvatarSettings} from "components/SettingsDialog/Components/AvatarSettings";
import {SettingsInput} from "components/SettingsDialog/Components/SettingsInput";
import {useTranslation} from "react-i18next";

export const OnboardingIntro = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  const state = useAppSelector((applicationState) => ({
    user: applicationState.auth.user!,
    participants: applicationState.participants,
  }));
  const [userName, setUserName] = useState<string>(state.user.name);
  let introImage;
  let title;
  let content;

  useEffect(() => {
    sessionStorage.setItem("onboarding_phase", JSON.stringify(phase));
    sessionStorage.setItem("onboarding_step", JSON.stringify(step));
    if (!state.participants) {
      store.dispatch(Actions.setParticipants([{user: state.user, connected: true, raisedHand: false, showHiddenColumns: true, ready: false, role: "OWNER"}]));
    }
    if (phase === "newBoard") {
      navigate("/onboarding-new");
    }
  }, [phase, navigate, step, state.user, state.participants]);

  if (phase === "intro" && step === 1) {
    introImage = <NewScrumMaster />;
    title = "Meet Mike!";
    content = "He somehow ended up as the new Scrum-Master for a Software-Development Team. \n" + "Now, he was tasked with moderating the Retrospective . . .";
  } else if (phase === "intro" && step === 2) {
    content =
      "Luckily, he has competent mentors like you and Stan! \n" + "You recommend him the free, secure, and open-source tool Scrumlr to help him with the Retrospective . . .";
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
      {phase === "intro" && (step === 1 || step === 3) && (
        <div className="onboarding-intro__container">
          <div className="onboarding-intro__hero">{introImage}</div>
          <h2 className="onboarding-intro__title">{title}</h2>
          <div className="onboarding-intro__content">
            <p>{content}</p>
          </div>
        </div>
      )}
      {phase === "intro" && step === 2 && (
        <div className="onboarding-intro__container">
          <div className="onboarding-intro__mentors">
            <div className="onboarding-intro__mentors-avatar">
              <SettingsInput
                id="profileSettingsUserName"
                label={t("ProfileSettings.UserName")}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                submit={() => store.dispatch(Actions.editSelf({...state.user, name: userName}))}
              />
              {state.participants && <AvatarSettings id={state.user.id} />}
            </div>
            <div className="onboarding-intro__mentors-stan">
              <StanMentor />
            </div>
          </div>
          <h2 className="onboarding-intro__title">{title}</h2>
          <div className="onboarding-intro__content">
            <p>{content}</p>
          </div>
        </div>
      )}

      <OnboardingController />
    </div>
  );
};
