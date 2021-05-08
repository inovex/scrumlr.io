import * as React from "react";

import "./AboutModal.scss";
import Modal from "../Modal";
import Raven = require("raven-js");
import { slack } from "../../../config";
import Icon from "../../Icon";
import classNames = require("classnames");

export type TabType = "about" | "changelog";

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
    this.state = { showTab: "about", email: "", messageBody: "" };
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
          : "Someone wrote:\n> ") + this.state.messageBody;

      if (Boolean(slack.feedbackHook)) {
        fetch(slack.feedbackHook as string, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text
          })
        })
          .then(() => {
            this.props.onClose();
          })
          .catch((error: any) => {
            Raven.captureMessage("Unable to send email", {
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
    const showAbout = this.state.showTab === "about";
    const showChangelog = this.state.showTab === "changelog";

    return (
      <Modal onClose={this.props.onClose} onSubmit={this.sendEmailOnClose}>
        <div className="about-modal__tabs">
          <button
            className={classNames("about-modal__tab-button", {
              "about-modal__tab-button--active": showAbout
            })}
            onClick={e => this.setTab("about")}
          >
            About
          </button>
          <button
            className={classNames("about-modal__tab-button", {
              "about-modal__tab-button--active": showChangelog
            })}
            onClick={e => this.setTab("changelog")}
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
              </p>
              <p>
                Read more about our{" "}
                <a
                  href="https://www.iubenda.com/privacy-policy/26348404"
                  target="_blank"
                >
                  Privacy Policy
                </a>
                , by clicking on the highlighted link.
              </p>
              <p>Thanks to all our users, contributors & supporters!</p>
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

        {showChangelog && (
          <div className="about-modal__content">
            <div className="about-modal__panel">
              <h2 className="about-modal__headline">Changelog</h2>

              <h3>2021/05/08</h3>
              <ul>
                <li>Fixed crash when note text is empty</li>
                <li>Disabled auto-complete for note input</li>
              </ul>

              <h3>2021/02/20</h3>
              <ul>
                <li>
                  Fixed bug where stacking of cards could result in a cycle and
                  lead to a fatal error
                </li>
                <li>
                  Renamed add card inputfield placeholder to 'add note', so that
                  Chrome won't suggest an auto-completion of ones credit card
                  information
                </li>
              </ul>

              <h3>2020/11/30</h3>
              <ul>
                <li>Enabled card stacking for every user</li>
              </ul>

              <h3>2020/11/14</h3>
              <ul>
                <li>Added "About" section, including an added changelog</li>
                <li>
                  Replaced QR-Code generator library within Share modal with
                  improved load time
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

export default AboutModal;
