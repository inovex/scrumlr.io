import React, {FormEvent, useRef, useState} from "react";
import classNames from "classnames";
import {SettingsButton} from "components/SettingsDialog/Components/SettingsButton";
import {FeedbackAPI} from "api/feedback";
import {ReactComponent as BugIcon} from "assets/icon-bug.svg";
import {ReactComponent as PraiseIcon} from "assets/icon-praise.svg";
import {ReactComponent as AddFeatureIcon} from "assets/icon-add-feature.svg";
import "./Feedback.scss";

export const Feedback: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const contactInput = useRef<HTMLInputElement>(null);
  const feedbackTextarea = useRef<HTMLTextAreaElement>(null);

  const onSubmitFeedback = (
    e: FormEvent<HTMLFormElement> & {target: {reset: () => void; feedbackType: {value: string}; feedback: {value: string}; contact: {value: string}}; preventDefault: () => void}
  ) => {
    e.preventDefault();
    setErrorMessage(undefined);
    const {feedbackType, feedback, contact} = e.target;
    if (feedbackType.value === "") {
      setErrorMessage("Please choose the type of your feedback!");
      return;
    }
    if (feedback.value === "") {
      setErrorMessage("Please be so kind a leave us some words");
      return;
    }
    if (
      contact.value !== "" &&
      !String(contact.value)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ) {
      setErrorMessage("Please enter a valid email address!");
      return;
    }
    FeedbackAPI.sendFeedback(feedbackType.value, feedback.value, contact.value);
    e.target.reset();
  };

  const renderFeedbackOptions = () => (
    <div className="settings-dialog__feedback-options">
      <div className="settings-dialog__feedback-option">
        <input type="radio" name="feedbackType" id="feedbackTypePraise" value="PRAISE" className="feedback-option__input" />
        <label htmlFor="feedbackTypePraise" className="feedback-option__label">
          <PraiseIcon />
          <span>Praise</span>
        </label>
      </div>

      <div className="settings-dialog__feedback-option">
        <input type="radio" name="feedbackType" id="feedbackTypeFeatureRequest" value="FEATURE_REQUEST" className="feedback-option__input" />
        <label htmlFor="feedbackTypeFeatureRequest" className="feedback-option__label">
          <AddFeatureIcon />
          <span>Feature Request</span>
        </label>
      </div>

      <div className="settings-dialog__feedback-option">
        <input type="radio" name="feedbackType" id="feedbackTypeBugReport" value="BUG_REPORT" className="feedback-option__input" />
        <label htmlFor="feedbackTypeBugReport" className="feedback-option__label">
          <BugIcon />
          <span>Bug Report</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="settings-dialog__container accent-color__poker-purple">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__poker-purple")}>Feedback</h2>
      </div>
      <form className="settings-dialog__feedback-form" onSubmit={onSubmitFeedback}>
        {renderFeedbackOptions()}
        <SettingsButton label="Anything else you want to tell us?" className="feedback-form__settings-button" onClick={() => feedbackTextarea.current?.focus()}>
          <textarea name="feedback" placeholder="Type your additional feedback here!" className="feedback-form__feedback-textarea" ref={feedbackTextarea} />
        </SettingsButton>
        <SettingsButton label="If you would like us to contact you, leave your email!" className="feedback-form__settings-button" onClick={() => contactInput.current?.focus()}>
          <input name="contact" placeholder="mail@inovex.de" className="feedback-form__contact-input" ref={contactInput} />
        </SettingsButton>
        <button type="submit" className="feedback-form__submit-button">
          Send Feedback
        </button>
      </form>
      {errorMessage && <span className="settings-dialog__error-message">{errorMessage}</span>}
    </div>
  );
};
