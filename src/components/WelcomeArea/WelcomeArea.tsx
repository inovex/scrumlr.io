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

          <div className="welcome-area__migration">
            <p>
              Like George Bernard Show we really believe that "progress is impossible without change".
              Consequently Scrumlr has to change too and we are happy to announce that from now on you can start exploring
              our new iteration of the application on <a href="https://beta.scrumlr.io">beta.scrumlr.io</a>. Checkout our
              {" "}<a href="https://github.com/inovex/scrumlr.io/wiki/Release-announcement">release announcement</a>{" "}
              for further information.
            </p>

            <p className="welcome-area__migration-disclaimer">
              We expect to enroll the new version on 1st August 2022 without a data migration and further notice. Please
              make sure that you export all of your boards and save the results of your sessions by that time.
            </p>

            <a href="https://beta.scrumlr.io" className="welcome-area__gimme-beta">GIMME THE BETA <Icon className="welcome-area__gimme-beta-icon" name="circle-arrow-right" /> </a>
          </div>
        </div>
      </div>
    </div>

    <div className="welcome-area__action-area">
      <div className="welcome-area__action-area-main">{children}</div>
      <div className="welcome-area__action-area-footer">
        <p>
          &copy; {new Date().getFullYear()}, Powered by{' '}
          <Icon
            name="inovex"
            width={16}
            height={16}
            className="welcome-area__action-area-logo"
          />{' '}
          <a href="https://www.inovex.de/" target="_blank">
            inovex
          </a>
        </p>
        <a href="https://github.com/inovex/scrumlr.io" target="_blank">
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
