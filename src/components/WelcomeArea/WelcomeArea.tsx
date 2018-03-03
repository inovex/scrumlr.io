import * as React from 'react';
import './WelcomeArea.css';

export const WelcomeArea: React.SFC<{}> = ({ children }) =>
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
      {children}
    </div>
  </div>;

export default WelcomeArea;
