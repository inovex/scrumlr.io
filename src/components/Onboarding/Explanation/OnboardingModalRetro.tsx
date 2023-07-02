import {ReactComponent as StanOk} from "assets/stan/Stan_Ok.svg";
import "./OnboardingModalRetro.scss";

export const OnboardingModalRetro = () => (
  <div className="onboarding-modal-retro">
    <div className="onboarding-modal-retro__title">
      <h2>Retrospectives</h2>
    </div>

    <div className="onboarding-modal-retro__content">
      <div className="onboarding-modal-retro__content-description">
        <p>Retrospectives are opportunities to learn and improve by taking a look back!</p>
      </div>
      <div className="onboarding-modal-retro__content-questions">
        <p>We mainly try to answer 3 questions:</p>
        <ul>
          <li>
            <b>1. </b> What worked well?
          </li>
          <li>
            <b>2. </b> What didn&apos;t work well?
          </li>
          <li>
            <b>3. </b>What are we going to try differently?
          </li>
        </ul>
      </div>
    </div>
    <div className="onboarding-modal-retro__image">
      <StanOk />
    </div>
  </div>
);
