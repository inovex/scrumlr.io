import * as React from 'react';
import './WelcomeArea.scss';
import { Icon } from '../Icon/Icon';

export const WelcomeArea: React.SFC<{}> = ({ children }) => (
  <div className="welcome-area">
    <div className="welcome-area__promotion-wrapper">
      <div className="welcome-area__promotion">
        <h1 className="welcome-area__headline">Scrumlr</h1>

        <div className="welcome-area__promotion-text">
          <h2>Progress is impossible without change</h2>

          <p>
            Take a seat and let us guide you and your team through your first
            online retrospective. Start your first session within seconds -
            completely for free, no registration or payment details required.
            Put your thoughts and your feedback on cards and share them
            instantly on a collaborative virtual board. Vote on the topics that
            really matter. Learn and grow as a team.
          </p>
        </div>
      </div>
    </div>

    <div className="welcome-area__action-area">
      <div className="welcome-area__action-area-main">{children}</div>
      <div className="welcome-area__action-area-footer">
        <p>
          &copy; {new Date().getFullYear()}, Provided by{' '}
          <Icon
            name="inovex"
            width={16}
            height={16}
            className="welcome-area__action-area-logo"
          />{' '}
          <a href="https://www.inovex.de/" target="_blank">
            inovex
          </a>{' '}
          employees
        </p>
        <a href="https://github.com/scrumlr/scrumlr.io" target="_blank">
          Contribute to this open source project on GitHub
        </a>
        <div className="welcome-area__policies">
          <ul>
            <li>
              <a
                href="https://www.iubenda.com/privacy-policy/26348404"
                target="_blank"
                title="Privacy Policy"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://www.iubenda.com/privacy-policy/26348404/cookie-policy"
                target="_blank"
                title="Cookie Policy"
              >
                Cookie Policy
              </a>
            </li>
            <li>
              <a
                href="https://www.iubenda.com/terms-and-conditions/26348404"
                target="_blank"
                title="Terms and Conditions"
              >
                Terms and Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default WelcomeArea;
