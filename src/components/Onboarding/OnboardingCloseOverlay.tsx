import "./OnboardingCloseOverlay.scss";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";

export const OnboardingCloseOverlay = () => {
  const dispatch = useDispatch();

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="onboarding-close-overlay"
      onClick={() => {
        dispatch(Actions.toggleStepOpen());
      }}
    />
  );
};
