import "./CookiePolicy.scss";
import store from "store";
import {ActionFactory} from "store/action";
import Portal from "components/Portal/Portal";

interface CookiePolicyProps {
  scrumlrCookieName: string;
  acceptFunction: () => void;
  onClose: () => void;
  show: boolean;
}

const CookiePolicy = ({scrumlrCookieName, acceptFunction, onClose, show}: CookiePolicyProps) => {
  if (!show) {
    return null;
  }

  const handleAccept = () => {
    acceptFunction();
    store.dispatch(ActionFactory.addCookie(scrumlrCookieName, true));
  };

  return (
    <Portal onClose={onClose}>
      <div className="cookie-policy">
        <div className="cookie-policy__title">
          <h3>Cookie Policy of scrumlr.io</h3>
        </div>
        <div className="cookie-policy__body">
          <p>
            This document informs Users about the technologies that help scrumlr.io to achieve the purposes described below. Such technologies allow the Owner to access and store
            information (for example by using a Cookie) or use resources (for example by running a script) on a User’s device as they interact with scrumlr.io.
          </p>
          <p>
            For simplicity, all such technologies are defined as &quot;Trackers&quot; within this document – unless there is a reason to differentiate. For example, while Cookies
            can be used on both web and mobile browsers, it would be inaccurate to talk about Cookies in the context of mobile apps as they are a browser-based Tracker. For this
            reason, within this document, the term Cookies is only used where it is specifically meant to indicate that particular type of Tracker.
          </p>
          <p>
            Some of the purposes for which Trackers are used may also require the User&apos;s consent. Whenever consent is given, it can be freely withdrawn at any time following
            the instructions provided in this document.
          </p>
          <p>
            Scrumlr.io only uses Trackers managed directly by the Owner (so-called &quot;first-party&quot; Trackers). The validity and expiration periods of first-party Cookies and
            other similar Trackers may vary depending on the lifetime set by the Owner. Some of them expire upon termination of the User’s browsing session.
          </p>
          <h4>Activities strictly necessary for the operation of scrumlr.io and delivery of the Service</h4>
          <p>
            Scrumlr.io uses so-called “technical” Cookies and other similar Trackers to carry out activities that are strictly necessary for the operation or delivery of the
            Service.
          </p>
          <h4>How to manage preferences and provide or withdraw consent</h4>
          <p>There are various ways to manage Tracker related preferences and to provide and withdraw consent, where relevant:</p>
          <p>Users can manage preferences related to Trackers from directly within their own device settings, for example, by preventing the use or storage of Trackers.</p>
          <p>
            Additionally, whenever the use of Trackers is based on consent, Users can provide or withdraw such consent by setting their preferences within the cookie notice or by
            updating such preferences accordingly via the relevant consent-preferences widget, if available.
          </p>
          <p>
            It is also possible, via relevant browser or device features, to delete previously stored Trackers, including those used to remember the User’s initial consent. Other
            Trackers in the browser’s local memory may be cleared by deleting the browsing history.
          </p>
          <h5>Locating Tracker Settings</h5>
          <p>Users can, for example, find information about how to manage Cookies in the most commonly used browsers at the following addresses:</p>
          <ul>
            <li>Google Chrome</li>
            <li>Mozilla Firefox</li>
            <li>Apple Safari</li>
            <li>Microsoft Internet Explorer</li>
            <li>Microsoft Edge</li>
            <li>Brave</li>
            <li>Opera</li>
          </ul>
          <p>
            Users may also manage certain categories of Trackers used on mobile apps by opting out through relevant device settings, such as the device advertising settings for
            mobile devices, or tracking settings in general (Users may open the device settings, view and look for the relevant setting).
          </p>
          <h4>Owner and Data Controller</h4>
          <p>
            inovex GmbH <br />
            Karlsruher Straße 71 <br />
            75179 Pforzheim <br />
            Germany <br />
            <br />
            Owner contact email: info@scrumlr.io <br />
            <br />
            Given the objective complexity surrounding tracking technologies, Users are encouraged to contact the Owner should they wish to receive any further information on the
            use of such technologies by scrumlr.io.
          </p>
          <button className="cookie-policy__button-accept" type="button" onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default CookiePolicy;
