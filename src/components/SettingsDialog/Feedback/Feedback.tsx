import React, {FormEvent, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {SettingsButton} from "components/SettingsDialog/Components/SettingsButton";
import {FeedbackAPI} from "api/feedback";
import {useAppSelector} from "store";
import {ReactComponent as BugIcon} from "assets/icon-bug.svg";
import {ReactComponent as PraiseIcon} from "assets/icon-praise.svg";
import {ReactComponent as AddFeatureIcon} from "assets/icon-add-feature.svg";
import "./Feedback.scss";

export const Feedback: React.FC = () => {
  const {t} = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [feedbackTypeInput, setFeedbackTypeInput] = useState("PRAISE");
  const [feedbackInputLabel, setFeedbackInputLabel] = useState<string>(t("Feedback.PraiseInputLabel"));
  const feedbackEnabled = useAppSelector((state) => state.view.feedbackEnabled);
  const contactInput = useRef<HTMLInputElement>(null);
  const feedbackTextarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (feedbackTypeInput === "PRAISE") {
      setFeedbackInputLabel(t("Feedback.PraiseInputLabel"));
    } else if (feedbackTypeInput === "FEATURE_REQUEST") {
      setFeedbackInputLabel(t("Feedback.FeatureRequestInputLabel"));
    } else {
      setFeedbackInputLabel(t("Feedback.BugReportInputLabel"));
    }
  }, [t, feedbackTypeInput]);

  const onSubmitFeedback = (e: FormEvent<HTMLFormElement> & {target: {reset: () => void; feedbackType: {value: string}; feedback: {value: string}; contact: {value: string}}}) => {
    e.preventDefault();
    setErrorMessage(undefined);
    const {feedbackType, feedback, contact} = e.target;
    if (feedbackType.value === "") {
      setErrorMessage(t("Feedback.ErrorUndefinedType"));
      return;
    }
    if (
      contact.value !== "" &&
      !String(contact.value)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ) {
      setErrorMessage(t("Feedback.ErrorInvalidEmail"));
      return;
    }
    if (feedbackType.value === "FEATURE_REQUEST" && feedback.value.trim() === "") {
      setErrorMessage(t("Feedback.ErrorMissingFeatureRequestText"));
      return;
    }
    if (feedbackType.value === "BUG_REPORT" && feedback.value.trim() === "") {
      setErrorMessage(t("Feedback.ErrorMissingBugReportText"));
      return;
    }
    FeedbackAPI.sendFeedback(feedbackType.value, feedback.value.trim(), contact.value.trim());
    e.target.reset();
  };

  const renderFeedbackOptions = () => (
    <div className="settings-dialog__feedback-options">
      <div className="settings-dialog__feedback-option">
        <input
          type="radio"
          name="feedbackType"
          id="feedbackTypePraise"
          value="PRAISE"
          className="feedback-option__input"
          defaultChecked
          onClick={() => setFeedbackTypeInput("PRAISE")}
        />
        <label htmlFor="feedbackTypePraise" className="feedback-option__label">
          <PraiseIcon />
          <span>Praise</span>
        </label>
      </div>

      <div className="settings-dialog__feedback-option">
        <input
          type="radio"
          name="feedbackType"
          id="feedbackTypeFeatureRequest"
          value="FEATURE_REQUEST"
          className="feedback-option__input"
          onClick={() => setFeedbackTypeInput("FEATURE_REQUEST")}
        />
        <label htmlFor="feedbackTypeFeatureRequest" className="feedback-option__label">
          <AddFeatureIcon />
          <span>Feature Request</span>
        </label>
      </div>

      <div className="settings-dialog__feedback-option">
        <input
          type="radio"
          name="feedbackType"
          id="feedbackTypeBugReport"
          value="BUG_REPORT"
          className="feedback-option__input"
          onClick={() => setFeedbackTypeInput("BUG_REPORT")}
        />
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
      {feedbackEnabled && (
        <form className="settings-dialog__feedback-form" onSubmit={onSubmitFeedback}>
          {renderFeedbackOptions()}
          <SettingsButton label={feedbackInputLabel} className="feedback-form__settings-button" onClick={() => feedbackTextarea.current?.focus()}>
            <textarea name="feedback" placeholder={t("Feedback.FeedbackInputPlaceholder")} className="feedback-form__feedback-textarea" ref={feedbackTextarea} />
          </SettingsButton>
          <SettingsButton label={t("Feedback.ContactInputLabel")} className="feedback-form__settings-button" onClick={() => contactInput.current?.focus()}>
            <input name="contact" placeholder="mail@inovex.de" className="feedback-form__contact-input" ref={contactInput} />
          </SettingsButton>
          <button type="submit" className="feedback-form__submit-button">
            {t("Feedback.SubmitButton")}
          </button>
        </form>
      )}
      {errorMessage && <span className="settings-dialog__error-message">{errorMessage}</span>}
    </div>
  );
};
