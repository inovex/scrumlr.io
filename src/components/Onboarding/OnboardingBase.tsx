import { useDispatch } from "react-redux";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import { Actions } from "store/action";
import "./Onboarding.scss";

export const OnboardingBase = () => {
  const dispatch = useDispatch();

  return (
    <div className="floater onboarding-base">
      <button className="close-floater"
        onClick={() => {
          dispatch(Actions.toggleStepOpen());
        }}>
        <CloseIcon />
      </button>
      <p>This is content</p>

    </div>
  )
}
