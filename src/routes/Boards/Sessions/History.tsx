import {Outlet, useOutletContext} from "react-router";
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
  favourite: boolean; // todo add to board table schema
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
    isLocked: true,
    userRole: "OWNER",
    favourite: true,
  },
  {
    id: "2",
    name: "Test Board 2",
    description:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    accessPolicy: "BY_PASSPHRASE",
    columns: ["Start", "Stop", "Continue", "Actions"],
    participants: 12,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    modifiedAt: new Date("2026-01-01T01:00:00.000Z"),
    notes: 5,
    isLocked: false,
    userRole: "PARTICIPANT",
    favourite: false,
  },
];

export const History = () => {
  const {t} = useTranslation();

  const {searchBarInput} = useOutletContext<{searchBarInput: string}>();

  const matchSearchInput = (historyBoard: HistoryBoard) => historyBoard.name.toLowerCase().includes(searchBarInput.toLowerCase());

  return (
    <>
      <Outlet /> {/* settings */}
      <div className="history">
        <div className="history__stan-container">
          <div className="history__stan-spacing" />
          <img className={classNames("history__stan", "history__stan--dark")} src={StanDark} alt="" />
          <img className={classNames("history__stan", "history__stan--light")} src={StanLight} alt="" />
        </div>
        <section className="history__container">
          <header className="history__container-header">
            <div className="templates__container-title">{t("History.savedBoards")}</div>
          </header>
          <div className="history__card-container">
            {TEST_HISTORY_BOARDS.filter(matchSearchInput)
              .sort((a, b) => Number(b.favourite) - Number(a.favourite)) // move favourites to the top using the fact that true is 1 and false is 0
              .map((hb) => (
                <HistoryCard key={hb.id} board={hb} />
              ))}
          </div>
        </section>
      </div>
    </>
  );
};
