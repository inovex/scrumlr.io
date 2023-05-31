import { useDispatch } from "react-redux";
import { Actions } from "store/action";
import "./Onboarding.scss";
import { useTranslation } from "react-i18next";
import { getColorForIndex } from "constants/colors";

type OnboardingFloaterProps = {
  text: string,
  isExercisePrompt: boolean
}

export const OnboardingBase = (props: OnboardingFloaterProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  return (
    <div className="floater onboarding-base">
      <div className="onboarding-img">
        <p>here comes an image</p>
      </div>
      <div className="onboarding-content">
        <p>{props.text}</p>
      </div>
      {props.isExercisePrompt ?
        <div className="onboarding-actions">
          <button className="button onboarding-skip"
            onClick={() => {}}>
            {t("Onboarding.skip")}
          </button>
          <button className="button onboarding-ok" onClick={() => {dispatch(Actions.toggleStepOpen())}}>
            {t("Onboarding.ok")}
          </button>
        </div>
      :
        <div className="onboarding-actions">
          <button className="button onboarding-next" onClick={() => {
            dispatch(Actions.incrementStep());
            let randomColor = getColorForIndex(Math.floor(Math.random() * 100));
            // dispatch(Actions.addNote("test", "asda"))
            }}>
            {t("Onboarding.next")}
          </button>
        </div>
      }
      {/* <div className="onboarding-actions">
        <button className="button onboarding-skip"
          onClick={() => {}}>
          {t("Onboarding.skip")}
        </button>
        {props.isExercisePrompt ?
          <button className="button onboarding-ok" onClick={() => {dispatch(Actions.toggleStepOpen())}}>
            {t("Onboarding.ok")}
          </button>
          :
          <button className="button onboarding-next" onClick={() => {dispatch(Actions.incrementStep())}}>
            {t("Onboarding.next")}
          </button>}
      </div> */}


    </div>
  )
}
