import "./CookiePolicy.scss";
import {useEffect, useState} from "react";
import Portal from "components/Portal/Portal";
import marked from "marked";
import policyText from "./CookiePolicyText.md";

interface CookiePolicyProps {
  acceptFunction: () => void;
  onClose: () => void;
  show: boolean;
}

const CookiePolicy = ({acceptFunction, onClose, show}: CookiePolicyProps) => {
  const [policy, setPolicy] = useState({markdown: ""});

  useEffect(() => {
    fetch(policyText)
      .then((response) => response.text())
      .then((text) => setPolicy({markdown: marked(text)}));
  }, []);

  if (!show) {
    return null;
  }

  const handleAccept = () => {
    acceptFunction();
  };

  return (
    <Portal onClose={onClose}>
      <div className="cookie-policy">
        <div className="cookie-policy__title">
          <h1>Cookie Policy of scrumlr.io</h1>
        </div>
        <div className="cookie-policy__body" dangerouslySetInnerHTML={{__html: policy.markdown}} />
        <div className="cookie-policy__footer">
          <button className="cookie-policy__button-accept" type="button" onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default CookiePolicy;
