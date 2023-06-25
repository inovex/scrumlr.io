import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import "./OnboardingTooltip.scss";

type OnboardingToolTipProps = {
  text: string;
  imgPosition: "top" | "right" | "bottom" | "left";
  image?: JSX.Element;
  buttonType: "next" | "ok";
};

export const OnboardingTooltip = (props: OnboardingToolTipProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  return (
    <div className={`floater onboarding-tooltip img-${props.imgPosition}`}>
      <div className="onboarding-tooltip__img">
        <div>{props.image}</div>
        {props.buttonType === "next" ? (
          <button
            className="button onboarding-next"
            onClick={() => {
              dispatch(Actions.incrementStep());
            }}
          >
            {t("Onboarding.next")}
          </button>
        ) : (
          <button
            className="button onboarding-next"
            onClick={() => {
              dispatch(Actions.toggleStepOpen());
            }}
          >
            {t("Onboarding.ok")}
          </button>
        )}
      </div>
      <div className="onboarding-tooltip__content">{props.text}</div>
    </div>
  );
};
