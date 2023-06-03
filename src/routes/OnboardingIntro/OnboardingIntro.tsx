import { useTranslation } from "react-i18next";
import { useAppSelector } from "store";
import { isEqual } from "underscore";
import { OnboardingController } from "components/Onboarding/OnboardingController";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Actions } from "store/action";
import { ScrumlrLogo } from "components/ScrumlrLogo";
import "./OnboardingIntro.scss"


export const OnboardingIntro = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  return (
    <div className="onboarding-intro-wrapper">
      <Link to="/" onClick={() => {dispatch(Actions.changePhase("none"))}}>
        <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      </Link>
      <div className="onboarding-intro-container">
        <div className="onboarding-intro-hero">
          <img src="" alt="onboarding" />
        </div>
        <div className="onboarding-intro-content">
          <p>content</p>
        </div>
      </div>
      <OnboardingController />
    </div>
  )
}
