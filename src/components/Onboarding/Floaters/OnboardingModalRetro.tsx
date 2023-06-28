import {ReactComponent as StanOk} from "assets/stan/Stan_Ok.svg";
import {useDispatch} from "react-redux";
import "./OnboardingModalRetro.scss";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";

export const OnboardingModalRetro = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  return (
    <div className="floater onboarding-modal-retro">
      <div className="onboarding-modal-retro__title">
        <h2>Retrospectives</h2>
      </div>

      <div className="onboarding-modal-retro__content">
        <div className="onboarding-modal-retro__content-description">
          <p>Retrospectives are opportunities to learn and improve by looking back!</p>
        </div>
        <div className="onboarding-modal-retro__content-questions">
          <p>We mainly try to answer 3 questions:</p>
          <ul>
            <li>
              <b>1. </b> What worked well?
            </li>
            <li>
              <b>2. </b> What didn't work well?
            </li>
            <li>
              <b>3. </b>What are we going to try differently?
            </li>
          </ul>
        </div>
        <div className="onboarding-modal-retro__next">
          <button
            className="button onboarding-next"
            onClick={() => {
              dispatch(Actions.incrementStep());
            }}
          >
            {t("Onboarding.next")}
          </button>
        </div>
      </div>
      <div className="onboarding-modal-retro__image">
        <StanOk />
      </div>
    </div>
  );
};
