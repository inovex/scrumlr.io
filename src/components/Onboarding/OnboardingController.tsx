import { useAppSelector } from "store";
import { isEqual } from "underscore";
import Floater from "react-floater";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg"
import { shallowEqual, useDispatch } from "react-redux";
import { Actions } from "store/action";
import { useTranslation } from "react-i18next";
import { OnboardingBase } from "./OnboardingBase";
import "./Onboarding.scss";

export const OnboardingController = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  const stepOpen = useAppSelector((state) => state.onboarding.stepOpen, isEqual);
  const rootState = useAppSelector((state) => state, shallowEqual)
  let floater;
  switch (phase) {
    case "intro":
      if(step === 1) {
        // placeholder
      } else if (step === 2) {
        // placeholder
      }
      break;
    case "newBoard":
      if (step === 1) {
        const text = t("Onboarding.newBoardWelcome")
        floater = <Floater open={stepOpen} component={<OnboardingBase text={text} isExercisePrompt />}
        placement="center" styles={{arrow: {color: "#0057ff"}}} />
      } else if (step === 2) {
        // placeholder
      }
      break;
    case "board_check_in":
      if (step === 1) {
        const text = t("Onboarding.newBoardWelcome")
        floater = <Floater open={stepOpen} component={<OnboardingBase text={text} isExercisePrompt={false} />} target=".user-menu"
        placement="right" styles={{arrow: {color: "#0057ff"}}} />
      } else if (step === 2) {
        const madColumn = rootState.columns.find((c) => c.name === "Mad");
        const sadColumn = rootState.columns.find((c) => c.name === "Sad");
        const gladColumn = rootState.columns.find((c) => c.name === "Glad");
        dispatch(Actions.addOnboardingNote((madColumn?.id ?? ""), "i am mad", "Mike"));
        dispatch(Actions.addOnboardingNote((madColumn?.id ?? ""), "i am also mad", "Mike"));
        dispatch(Actions.addOnboardingNote((sadColumn?.id ?? ""), "i am so sad", "Mike"));
        dispatch(Actions.addOnboardingNote((gladColumn?.id ?? ""), "i am very glad", "Mike"));
        dispatch(Actions.incrementStep());
      } else if (step === 3) {
        dispatch(Actions.changePhase("board_data"));
      }
      break;
    case "board_data":
      if (step === 1) {
        // placeholder
      } else if (step === 2) {
        // placeholder
      }
      break;
    case "board_insights":
      if (step === 1) {
        // placeholder
      }
      break;
    case "board_actions":
      if (step === 1) {
        // placeholder
      } else if (step === 2) {
        // placeholder
      } else if (step === 3) {
        // placeholder
      }
      break;
    case "board_check_out":
      if (step === 1) {
        // placeholder
      } else if (step === 2) {
        // placeholder
      }
      break;
    case "outro":

      break;
    default:
      break;
  }

  return (
    <div className="onboarding-controller-wrapper">
      <div className="onboarding-controller">
        <button
          className="onboarding-button onboarding-skip-button"
          aria-label="Skip this phase"
          onClick={() => {
            dispatch(Actions.incrementStep(100))
          }}>
          {t("Onboarding.skip")}
        </button>

        <button
          className="onboarding-icon-button"
          aria-label="Toggle Onboarding Popup"
          onClick={() => {
            dispatch(Actions.toggleStepOpen())
          }}>
          <StanIcon />
        </button>

        <button
          className="onboarding-button onboarding-next-button"
          aria-label="Go to next step"
          onClick={() => {
            dispatch(Actions.incrementStep())
          }}>
          {t("Onboarding.next")}
        </button>
      </div>

      {floater}
    </div>

  )
}
