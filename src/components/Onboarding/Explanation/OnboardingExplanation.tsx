/* eslint-disable jsx-a11y/no-static-element-interactions */
import {useState} from "react";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as GatheringDataImg} from "assets/onboarding/Gathering-Data-Image.svg";
import {ReactComponent as GenerateInsights} from "assets/onboarding/Generate-Insights-Image.svg";
import setStageImg from "assets/onboarding/SetStage-Image.png";
import decideImg from "assets/onboarding/Decide-Image.png";
import stanDrink from "assets/stan/Slooth_drink.png";
import {OnboardingModalRetro} from "./OnboardingModalRetro";
import "./OnboardingExplanation.scss";
import {OnboardingModal} from "../Floaters/OnboardingModal";

export const OnboardingExplanation = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const EXPLANATION_STEPS = 6;
  const [explanationStep, setExplanationStep] = useState(1);

  return (
    <div className="onboarding-explanation__wrapper" onClick={() => dispatch(Actions.toggleExplanationOpen())}>
      <div className="onboarding-explanation" onClick={(e) => e.stopPropagation()}>
        <button
          className="onboarding-explanation__close"
          onClick={() => {
            dispatch(Actions.toggleExplanationOpen());
          }}
        >
          <CloseIcon className="close-button__icon" />
        </button>
        <div className="onboarding-explanation__back">
          <button
            className={`${explanationStep <= 1 ? "btn-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (explanationStep > 1) {
                setExplanationStep(explanationStep - 1);
              }
            }}
          >
            {"<"}
          </button>
        </div>
        <div className="onboarding-explanation__content">
          {explanationStep === 1 && <OnboardingModalRetro />}
          {explanationStep === 2 && (
            <OnboardingModal
              textContent={t("Onboarding.checkInWelcome")}
              title="Phase 1: Set the Stage"
              image={<img src={setStageImg} alt="Whiteboard with set-the-stage activity icons" />}
            />
          )}
          {explanationStep === 3 && <OnboardingModal image={<GatheringDataImg />} textContent={t("Onboarding.gatherDataWelcome")} title="Phase 2: Gather Data/Topics" />}
          {explanationStep === 4 && <OnboardingModal image={<GenerateInsights />} title="Phase 3: Generate Insights" textContent={t("Onboarding.insightsWelcome")} />}
          {explanationStep === 5 && (
            <OnboardingModal
              image={<img src={decideImg} alt="Stan with question-marks and exclamation-points" />}
              title="Phase 4: Decide what to do"
              textContent={t("Onboarding.decideWelcome")}
            />
          )}
          {explanationStep === 6 && (
            <OnboardingModal image={<img src={stanDrink} alt="Stan drinking" />} title="Phase 5: Close the Retrospective" textContent={t("Onboarding.checkOutWelcome")} />
          )}
        </div>
        <div className="onboarding-explanation__next">
          <button
            className={`${explanationStep >= EXPLANATION_STEPS ? "btn-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (explanationStep < EXPLANATION_STEPS) {
                setExplanationStep(explanationStep + 1);
              }
            }}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};
