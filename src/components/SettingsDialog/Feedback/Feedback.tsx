import React, {FormEvent} from "react";
import classNames from "classnames";
import "./Feedback.scss";
import {ReactComponent as BugIcon} from "assets/icon-bug.svg";
import {ReactComponent as PraiseIcon} from "assets/icon-praise.svg";
import {ReactComponent as AddFeatureIcon} from "assets/icon-add-feature.svg";

export const Feedback: React.FC = () => {
  const onSubmitFeedback = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const renderFeedbackOptions = () => (
    <div className="settings-dialog__feedback-options">
      <div className="settings-dialog__feedback-option">
        <input type="radio" name="feedbackType" id="feedbackTypePraise" value="Praise" className="feedback-option__input" />
        <label htmlFor="feedbackTypePraise" className="feedback-option__label">
          <PraiseIcon />
          <span>Praise</span>
        </label>
      </div>

      <div className="settings-dialog__feedback-option">
        <input type="radio" name="feedbackType" id="feedbackTypeFeatureRequest" value="Praise" className="feedback-option__input" />
        <label htmlFor="feedbackTypeFeatureRequest" className="feedback-option__label">
          <AddFeatureIcon />
          <span>Feature Request</span>
        </label>
      </div>

      <div className="settings-dialog__feedback-option">
        <input type="radio" name="feedbackType" id="feedbackTypeBugReport" value="Praise" className="feedback-option__input" />
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
        <button type="submit" className="feedback-form__submit-button">
          Send Feedback
        </button>
      </form>
    </div>
  );
};
