import * as React from 'react';

import './FeedbackModal.css';
import Input from '../../Input';
import Modal from '../Modal';
import Textarea from '../../Textarea';
import Raven = require('raven-js');
import { slack } from '../../../config';

export interface FeedbackModalProps {
  onClose: () => void;
  sendMail: (content: string, email?: string) => void;
}

export interface FeedbackModalState {
  email: string;
  messageBody: string;
}

export class FeedbackModal extends React.Component<
  FeedbackModalProps,
  FeedbackModalState
> {
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
        fetch(slack.feedbackHook, {
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
    return (
      <Modal onClose={this.props.onClose} onSubmit={this.sendEmailOnClose}>
        <div className="feedback-modal__content">
          <div className="feedback-modal__intro-panel">
            <h2 className="feedback-modal__headline">Feedback</h2>

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

          <div className="feedback-modal__message-panel">
            <Textarea
              id="feedback-modal__message"
              label="Your message"
              onChange={this.setMessageBody}
              invertPlaceholder={false}
              focusTheme="mint"
              placeholder="Hello friend\n\nhere is some space for your feedback and your thoughts.\n\nThank you for your support!"
              showUnderline={true}
              description="Your message"
              className="feedback-modal__textarea"
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default FeedbackModal;
