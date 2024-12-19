import {Outlet, useOutletContext} from "react-router";
import classNames from "classnames";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {t} from "i18next";
import StanDark from "../../../assets/stan/Stan_OK_Cropped_Light.png";
// import StanDark from "../../../assets/stan/Stan_OK_Dark.svg";
import {EXAMPLESESSIONSFORSEARCHFCT /* EXAMPLE_CUSTOM_TEMPLATE */} from "../../../constants/templates";
import {SessionCard} from "../../../components/Sessions/SessionCard/SessionCard";
// import StanLight from "../../../assets/stan/Stan_OK_Light.svg";
// import StanDark from "../../../assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
// import {RECOMMENDED_TEMPLATES} from "../../../constants/templates";
// import {TemplateCard} from "../../../components/Templates";
import "./Sessions.scss";
import StanLight from "../../../assets/stan/Stan_OK_Cropped_Light.png";
// import {AccessPolicy} from "store/features";

export const Sessions = () => {
  const searchBarInput: string = useOutletContext();

  return (
    <>
      <Outlet /> {/* settings */}
      {/* <img className={classNames("templates__stan", "templates__stan--dark")} src={StanDark} alt="Stan giving you his approval" /> */}
      <div className="sessions" /* style={{display: "contents"}} */>
        <div className="sessions__interior">
          <div className="sessions__container">
            {/* <img className={classNames("templates__stan", "templates__stan--light")} src={StanLight} alt="Stan giving you his approval" /> */}
            <div className="sessions__card-container">
              <header className="sessions__container-header">
                <button className="sessions__container-arrow-button">
                  <ArrowLeft className={classNames("sessions__container-arrow", "sessions__container-arrow--left")} />
                </button>
                <div className="sessions__container-title" role="button">
                  {t("Sessions.savedSessions")}
                </div>
              </header>
              <div className="sessions__card-container">
                {EXAMPLESESSIONSFORSEARCHFCT.filter(
                  (template) => template.name.toLowerCase().includes(searchBarInput.toLowerCase()) || template.description?.toLowerCase().includes(searchBarInput.toLowerCase())
                ).map((template) => (
                  <SessionCard template={template} />
                ))}
                {/* <SessionCard template={EXAMPLE_CUSTOM_TEMPLATE} /> */}
                {/* <SessionCard template={EXAMPLE_CUSTOM_TEMPLATE} /> */}
              </div>
            </div>
          </div>
          <div className="sessions__stan-container">
            <img className={classNames("sessions__stan", "sessions__stan--dark")} src={StanLight} alt="Stan giving you his approval" />
            <img className={classNames("sessions__stan", "sessions__stan--light")} src={StanDark} alt="Stan giving you his approval" />
          </div>
        </div>
      </div>
    </>
  );
};
