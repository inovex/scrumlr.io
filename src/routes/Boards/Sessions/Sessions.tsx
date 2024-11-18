import {Outlet, useOutletContext} from "react-router-dom";
import classNames from "classnames";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {t} from "i18next";
import StanDark from "../../../assets/stan/Stan_OK_Cropped_Light.png";
// import StanDark from "../../../assets/stan/Stan_OK_Dark.svg";
import {BoardTemplate /* EXAMPLE_CUSTOM_TEMPLATE */} from "../../../constants/templates";
import {SessionCard} from "../../../components/Sessions/SessionCard/SessionCard";
// import StanLight from "../../../assets/stan/Stan_OK_Light.svg";
// import StanDark from "../../../assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
// import {RECOMMENDED_TEMPLATES} from "../../../constants/templates";
// import {TemplateCard} from "../../../components/Templates";
import "./Sessions.scss";
import StanLight from "../../../assets/stan/Stan_OK_Cropped_Light.png";
import {AccessPolicy} from "../../../store/features";

export const EXAMPLESESSIONSFORSEARCHFCT: BoardTemplate[] = [
  {
    name: "Custom Template",
    accessPolicy: AccessPolicy.BY_PASSPHRASE,
    description:
      "Lorem lol ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
      "At vero eos et accusam et justo duo dolores et ea rebum. " +
      "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
      "sed diam nonumy eirmod tempor invidunt ut " +
      "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
      " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
      "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
      "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
      "\n" +
      "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
      "vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
      "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
      " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
      "\n" +
      "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
      " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
      "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
    favourite: true,
    columns: [
      {
        name: "Stuff",
        color: "goal-green",
        visible: true,
        index: 0,
      },
      {
        name: "Actions",
        color: "poker-purple",
        visible: false,
        index: 1,
      },
    ],
  },
  {
    name: "Custom Template 2",
    accessPolicy: AccessPolicy.BY_PASSPHRASE,
    description:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
      "At vero eos et accusam et justo duo dolores et ea rebum. " +
      "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
      "sed diam nonumy eirmod tempor invidunt ut " +
      "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
      " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
      "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
      "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
      "\n" +
      "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
      "vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
      "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
      " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
      "\n" +
      "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
      " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
      "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
    favourite: true,
    columns: [
      {
        name: "Stuff",
        color: "goal-green",
        visible: true,
        index: 0,
      },
      {
        name: "Actions",
        color: "poker-purple",
        visible: false,
        index: 1,
      },
    ],
  },
  {
    name: "Custom Template 3",
    accessPolicy: AccessPolicy.BY_PASSPHRASE,
    description:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
      "At vero eos et accusam et justo duo dolores et ea rebum. " +
      "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
      "sed diam nonumy eirmod tempor invidunt ut " +
      "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
      " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
      "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
      "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
      "\n" +
      "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
      "vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
      "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
      " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
      "\n" +
      "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
      " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
      "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
    favourite: true,
    columns: [
      {
        name: "Stuff",
        color: "goal-green",
        visible: true,
        index: 0,
      },
      {
        name: "Actions",
        color: "poker-purple",
        visible: false,
        index: 1,
      },
    ],
  },
];

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
