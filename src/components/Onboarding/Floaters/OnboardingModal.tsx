import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./OnboardingModal.scss";
import {useTranslation} from "react-i18next";

type OnboardingModalProps = {
  textContent: string;
  title: string;
  image?: JSX.Element;
  hasNextButton?: boolean;
};

export const OnboardingModal = (props: OnboardingModalProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  return (
    <div className="floater onboarding-modal">
      <button className="onboarding-modal__close" onClick={() => dispatch(Actions.toggleStepOpen())}>
        <CloseIcon className="close-button__icon" />
      </button>
      <div className="onboarding-modal__img">{props.image}</div>
      <div className="onboarding-modal__title">
        <h2>{props.title}</h2>
      </div>
      <div className="onboarding-modal__content">{props.textContent}</div>
      {props.hasNextButton && (
        <div className="onboarding-modal__buttons">
          <button
            className="button onboarding-next"
            onClick={() => {
              dispatch(Actions.incrementStep());
            }}
          >
            {t("Onboarding.next")}
          </button>
        </div>
      )}
    </div>
  );
};
