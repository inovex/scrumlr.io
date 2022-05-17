import React, {FormEvent} from "react";
import classNames from "classnames";
import "./Feedback.scss";
import "../SettingsDialog.scss";

export const Feedback: React.FC = () => {
  const onSubmitFeedback = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__poker-purple")}>Feedback</h2>
      </div>
      <form className="settings-dialog__group" onSubmit={onSubmitFeedback}>
        <button type="submit" className="">
          Send Feedback
        </button>
      </form>
    </div>
  );
};
