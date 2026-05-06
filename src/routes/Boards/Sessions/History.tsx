import {Outlet} from "react-router";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import StanDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.svg";
import StanLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.svg";
import {AccessPolicy, ParticipantRole} from "store/features";
import {HistoryCard} from "./HistoryCard/HistoryCard";
import "./History.scss";

export type HistoryBoard = {
  id: string;
  name: string;
  description: string;
  accessPolicy: AccessPolicy;
  columns: string[];
  participants: number;
  createdAt: Date;
  modifiedAt: Date;
  notes: number;
  isLocked: boolean;
  userRole: ParticipantRole;
};

const TEST_HISTORY_BOARDS: HistoryBoard[] = [
  {
    id: "1",
    name: "Test Board 1",
    description: "This is a test board",
    accessPolicy: "PUBLIC",
    columns: ["Lean Coffee", "Actions"],
    participants: 3,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    modifiedAt: new Date("2026-01-01T01:00:00.000Z"),
    notes: 42,
    isLocked: false,
    userRole: "OWNER",
  },
];

export const History = () => {
  const {t} = useTranslation();
  return (
    <>
      <Outlet /> {/* settings */}
      <div className="history">
        <div className="history__stan-container">
          <div className="history__stan-spacing" />
          <img className={classNames("history__stan", "history__stan--dark")} src={StanDark} alt="" />
          <img className={classNames("history__stan", "history__stan--light")} src={StanLight} alt="" />
        </div>
        <div className="history_container">
          <header className="history__container-header">
            <div className="templates__container-title">{t("History.savedBoards")}</div>
          </header>
          <div className="history__card-container">
            {TEST_HISTORY_BOARDS.map((hb) => (
              <HistoryCard key={hb.id} board={hb} favourite={false} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
