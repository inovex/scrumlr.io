import {Outlet} from "react-router-dom";
import classNames from "classnames";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {t} from "i18next";
// import StanDark from "../../../assets/stan/Stan_OK_Dark.svg";
import {TemplateCard} from "../../../components/Templates";
import {EXAMPLE_CUSTOM_TEMPLATE} from "../../../constants/templates";
import {SessionCard} from "../../../components/Sessions/SessionCard/SessionCard";
// import StanLight from "../../../assets/stan/Stan_OK_Light.svg";
// import StanDark from "../../../assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
// import {RECOMMENDED_TEMPLATES} from "../../../constants/templates";
// import {TemplateCard} from "../../../components/Templates";

export const Sessions = () => (
  <>
    <Outlet /> {/* settings */}
    <div className="templates">
      {/* <img className={classNames("templates__stan", "templates__stan--dark")} src={StanDark} alt="Stan just hanging there with a coffee" /> */}
      <div className={classNames("templates__container")}>
        {/* <img className={classNames("templates__stan", "templates__stan--dark")} src={StanDark} alt="Stan just hanging there with a coffee" /> */}
        {/* <img className={classNames("templates__stan", "templates__stan--light")} src={StanLight} alt="Stan just hanging there with a coffee" /> */}
        <div className="templates__card-container">
          <header className="templates__container-header">
            <button className="templates__container-arrow-button">
              <ArrowLeft className={classNames("templates__container-arrow", "templates__container-arrow--left")} />
            </button>
            <div className="templates__container-title" role="button">
              {t("Sessions.savedSessions")}
            </div>
          </header>
          <div className="templates__card-container">
            <SessionCard template={EXAMPLE_CUSTOM_TEMPLATE} />
            <TemplateCard templateType="CUSTOM" template={EXAMPLE_CUSTOM_TEMPLATE} />
          </div>
        </div>
      </div>
    </div>
    {/* <section className="sessions__stan-container"> */}
    {/*   <img */}
    {/*     className={classNames("sessions__stan", "sessions__stan--dark")} */}
    {/*     src={StanDark} */}
    {/*     alt="Stan just hanging there with a coffee" */}
    {/*   /> */}
    {/*   /!* <img className={classNames("sessions__stan", "sessions__stan--light")} src={StanLight} alt="Stan just hanging there with a coffee" /> *!/ */}
    {/* </section> */}
  </>
);
