import * as React from 'react';

import './AboutModal.scss';
import Input from '../../Input';
import Modal from '../Modal';
import Textarea from '../../Textarea';
import Raven = require('raven-js');
import { slack } from '../../../config';
import Icon from 'components/Icon';

export type TabType = 'about' | 'feedback' | 'privacy' | 'changelog';

export interface AboutModalProps {
  onClose: () => void;
}

export interface AboutModalState {
  showTab: TabType;
  email: string;
  messageBody: string;
}

export class AboutModal extends React.Component<
  AboutModalProps,
  AboutModalState
> {
  constructor(props: AboutModalProps) {
    super(props);
    this.state = { showTab: 'about', email: '', messageBody: '' };
  }

  setTab = (tab: TabType) => {
    this.setState({ showTab: tab });
  };

  setEmail = (e: any) => {
    this.setState({ ...this.state, email: e.target.value });
  };

  setMessageBody = (e: any) => {
    this.setState({ ...this.state, messageBody: e.target.value });
  };

  sendEmailOnClose = () => {
    if (!!this.state && !!this.state.messageBody) {
      const text =
        (this.state.email
          ? `_${this.state.email}_ wrote:\n> `
          : 'Someone wrote:\n> ') + this.state.messageBody;

      if (Boolean(slack.feedbackHook)) {
        fetch(slack.feedbackHook as string, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text
          })
        })
          .then(() => {
            this.props.onClose();
          })
          .catch((error: any) => {
            Raven.captureMessage('Unable to send email', {
              extra: {
                reason: error
              }
            });
            this.props.onClose();
          });
      } else {
        console.log(text);
      }
    } else {
      this.props.onClose();
    }
  };

  render() {
    const showAbout = this.state.showTab === 'about';
    const showFeedback = this.state.showTab === 'feedback';
    const showPrivacy = this.state.showTab === 'privacy';
    const showChangelog = this.state.showTab === 'changelog';

    return (
      <Modal onClose={this.props.onClose} onSubmit={this.sendEmailOnClose}>
        <div className="about-modal__tabs">
          <button
            className="about-modal__tab-button"
            onClick={e => this.setTab('about')}
          >
            About
          </button>
          <button
            className="about-modal__tab-button"
            onClick={e => this.setTab('feedback')}
          >
            Feedback
          </button>
          <button
            className="about-modal__tab-button"
            onClick={e => this.setTab('privacy')}
          >
            Privacy
          </button>
          <button
            className="about-modal__tab-button"
            onClick={e => this.setTab('changelog')}
          >
            Changelog
          </button>
        </div>

        {showAbout && (
          <div className="about-modal__content">
            <div className="about-modal__panel">
              <h2 className="about-modal__headline">About</h2>

              <p>
                Scrumlr is an open source project powered by
                <Icon
                  name="inovex"
                  width={16}
                  height={16}
                  className="about-modal__inovex-logo"
                />
                <a href="https://www.inovex.de/de/" target="_blank">
                  inovex
                </a>
                .
                <br />
                <br />
                Thanks to all our users, contributors & supporters!
              </p>
            </div>

            <div className="about-modal__panel">
              <p className="about-modal__right-area">
                <b>Contributing</b>
                <br />
                <br />
                You're very welcome to be part of this project. You can
                contribute by opening an issue, by fixing a bug or by adding a
                feature and open a pull request.
                <br />
                <br />
                <a href="https://github.com/inovex/scrumlr.io" target="_blank">
                  Contribute to this open source project on GitHub
                </a>
              </p>
            </div>
          </div>
        )}

        {showFeedback && (
          <div className="about-modal__content">
            <div className="about-modal__panel">
              <h2 className="about-modal__headline">Feedback</h2>

              <p>
                Thank you for using and supporting Scrumlr. Like retrospectives
                help to grow and learn as a team and focus on creating great
                solutions, your feedback means the same to us.
              </p>

              <Input
                id="feedback-modal__email-input"
                label="E-Mail"
                description="(optional) Help us to get in touch with you"
                invertPlaceholder={false}
                focusTheme="mint"
                showUnderline={true}
                placeholder="yourmail@scrumlr.io"
                onChange={this.setEmail}
              />
            </div>

            <div className="about-modal__panel">
              <Textarea
                id="feedback-modal__message"
                label="Your message"
                onChange={this.setMessageBody}
                invertPlaceholder={false}
                focusTheme="mint"
                placeholder="Hello friend&#10;&#10;here is some space for your feedback and your thoughts.&#10;&#10;Thank you for your support!"
                showUnderline={true}
                description="Your message"
                className="about-modal__right-area"
              />
            </div>
          </div>
        )}

        {showPrivacy && (
          <div className="about-modal__content">
            <div className="about-modal__panel">
              <h2 className="about-modal__headline">
                Privacy policy of scrumlr.io
              </h2>

              <p>
                Scrumlr.io collects some Personal Data from its Users. Personal
                Data collected for the following purposes and using the
                following services:
                <br />
                <br />
                <b>Hosting and backend infrastructure</b>
                <br />
                Firebase Realtime Database and Firebase Cloud Functions Personal
                Data: Usage Data; various types of Data as specified in the
                privacy policy of the service Firebase Hosting Personal Data:
                various types of Data as specified in the privacy policy of the
                service
                <br />
                <br />
                <b>Registration and authentication</b>
                <br />
                Firebase Authentication Personal Data: email address; first
                name; last name; profile picture; username
              </p>
            </div>

            <div className="about-modal__panel">
              <p className="about-modal__right-area">
                <b>Contact information</b>
                <br />
                Owner and Data Controller
                <br />
                inovex GmbH <br />
                Karlsruher Straße 71 <br />
                75179 Pforzheim <br />
                Germany
                <br />
                Owner contact email: info@inovex.de
              </p>
            </div>
          </div>
        )}

        {showChangelog && (
          <div className="about-modal__content">
            <div className="about-modal__panel">
              <h2 className="about-modal__headline">Changelog</h2>

              <p>
                Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
                Lorem ipsum Lorem ipsum Lorem ipsum
              </p>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

export default AboutModal;
