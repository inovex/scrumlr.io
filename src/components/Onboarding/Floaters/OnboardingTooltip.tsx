import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";

type OnboardingToolTipProps = {
  text: string;
  imgPosition: "top" | "right" | "bottom" | "left";
  image?: JSX.Element;
  hasNextButton?: boolean;
};

export const OnboardingTooltip = (props: OnboardingToolTipProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  return (
    <div className={`floater onboarding-tooltip img-${props.imgPosition}`}>
      <div className="onboarding-tooltip__img">{props.image}</div>
      <div className="onboarding-tooltip__content">
        <div>{props.text}</div>
        {props.hasNextButton ?? (
          <button
            className="button onboarding-next"
            onClick={() => {
              dispatch(Actions.incrementStep());
            }}
          >
            {t("Onboarding.next")}
          </button>
        )}
      </div>
    </div>
  );
};
