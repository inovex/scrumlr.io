import { useAppSelector } from "store";
import "../BoardUsers/BoardUsers.scss";
import { isEqual } from "underscore";
import Floater from "react-floater";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import { useDispatch } from "react-redux";
import { Actions } from "store/action";
import { OnboardingBase } from "./OnboardingBase";
import "./Onboarding.scss";

export const OnboardingStan = () => {
  const dispatch = useDispatch();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  const stepOpen = useAppSelector((state) => state.onboarding.stepOpen, isEqual);
  let floater;
  switch (phase) {
    case "board_configure_template":
      if (step === 1) {
        floater = <Floater open={stepOpen} component={OnboardingBase} target=".user-menu"
        placement="right" styles={{arrow: {color: "#f9fafb"}}} />
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
    <div>
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
