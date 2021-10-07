import "./CookiePolicy.scss";
import {useEffect, useState} from "react";
import Portal from "components/Portal/Portal";
import marked from "marked";
import policyText from "./CookiePolicyText.md";

interface CookiePolicyProps {
  decline: () => void;
  accept: () => void;
  onClose: () => void;
  show: boolean;
  darkBackground: boolean;
}

const CookiePolicy = ({decline, accept, onClose, show, darkBackground}: CookiePolicyProps) => {
  const [policy, setPolicy] = useState({markdown: ""});

  useEffect(() => {
    fetch(policyText)
      .then((response) => response.text())
      .then((text) => setPolicy({markdown: marked(text)}));
  });

  if (!show) {
    return null;
  }

  return (
    <Portal onClose={onClose} darkBackground={darkBackground}>
      <div className="cookie-policy">
        <div className="cookie-policy__title">
          <h1>Cookie Policy of scrumlr.io</h1>
        </div>
        <div className="cookie-policy__body" dangerouslySetInnerHTML={{__html: policy.markdown}} />
        <div className="cookie-policy__footer">
          <button className="cookie-policy__button-decline" type="button" onClick={decline}>
            Decline
          </button>
          <button className="cookie-policy__button-accept" type="button" onClick={accept}>
            Accept
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default CookiePolicy;
