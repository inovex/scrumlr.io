import {Outlet, useOutletContext} from "react-router";
import classNames from "classnames";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {t} from "i18next";
import StanDark from "../../../assets/stan/Stan_OK_Cropped_Light.png";
import StanLight from "../../../assets/stan/Stan_OK_Cropped_Light.png";
import {SessionCard} from "../../../components/Sessions/SessionCard/SessionCard";
import "./Sessions.scss";
import {useAppSelector} from "../../../store";

export const Sessions = () => {
  const searchBarInput: string = useOutletContext();
  const sessions = useAppSelector((state) => state.sessions);

  // TODO remove
  console.log("Aktuelle Sessions: ", sessions);

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
                {/* <SessionCard session={DEFAULT_SESSION} /> */}
                {sessions
                  .filter(
                    (session) => session.name.toLowerCase().includes(searchBarInput.toLowerCase()) || session.description?.toLowerCase().includes(searchBarInput.toLowerCase())
                  )
                  .map((session) => (
                    <SessionCard session={session} />
                  ))}
              </div>
            </div>
          </div>
          <div className="sessions__stan-container">
            <img className={classNames("sessions__stan", "sessions__stan--dark", "sessions__stan-fixed")} src={StanLight} alt="Stan giving you his approval" />
            <img className={classNames("sessions__stan", "sessions__stan--light", "sessions__stan-fixed")} src={StanDark} alt="Stan giving you his approval" />
          </div>
        </div>
      </div>
    </>
  );
};
