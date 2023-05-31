import { useAppSelector } from "store";
import "../BoardUsers/BoardUsers.scss";
import { isEqual } from "underscore";
import Floater from "react-floater";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import { shallowEqual, useDispatch } from "react-redux";
import { Actions } from "store/action";
import { useTranslation } from "react-i18next";
import { OnboardingBase } from "./OnboardingBase";
import "./Onboarding.scss";

export const OnboardingStan = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  const stepOpen = useAppSelector((state) => state.onboarding.stepOpen, isEqual);
  const rootState = useAppSelector((state) => state, shallowEqual)
  let floater;
  switch (phase) {
    case "newBoard":
      if (step === 1) {
        const text = t("Onboarding.newBoardWelcome")
        floater = <Floater open={stepOpen} component={<OnboardingBase text={text} isExercisePrompt />}
        placement="center" styles={{arrow: {color: "#0057ff"}}} />
      }
      break;
    case "board_configure_template":
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
        const note1 = rootState.notes.find((n) => n.text === "i am mad");
        console.log("Note: " + note1?.id);
        dispatch(Actions.changePhase("board_check_in"));
      }
      break;
    case "board_check_in":

      break;
    case "board_note":

      break;
    case "board_voting_timer":

      break;
    case "board_present":

      break;
    case "board_export":

      break;
    default:
      break;
  }

  return (
    <div className="onboarding">
      <button
        className="share-button"
        aria-label="Toggle Onboarding Popup"
        onClick={() => {
          dispatch(Actions.toggleStepOpen())
        }}
      >
        <PlusIcon />
      </button>
      {floater}
    </div>

  )
}
