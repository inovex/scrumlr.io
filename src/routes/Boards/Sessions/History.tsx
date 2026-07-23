import {useEffect} from "react";
import {Outlet, useOutletContext} from "react-router";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import StanDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.svg";
import StanLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.svg";
import {InfoIcon} from "components/Icon";
import {useAppDispatch, useAppSelector} from "store";
import {HistoryBoard, getBoards} from "store/features";
import {HistoryCard} from "./HistoryCard/HistoryCard";
import "./History.scss";

export type {HistoryBoard} from "store/features";

export const History = () => {
  const {t} = useTranslation();

  const {searchBarInput} = useOutletContext<{searchBarInput: string}>();

  const dispatch = useAppDispatch();
  const historyBoards = useAppSelector((state) => state.history);

  useEffect(() => {
    if (historyBoards.length === 0) dispatch(getBoards());
  }, [dispatch, historyBoards.length]);

  const matchSearchInput = (historyBoard: HistoryBoard) => historyBoard.name.toLowerCase().includes(searchBarInput.toLowerCase());

  // for development, only show history boards if the env variable is set to true, otherwise show the teaser
  const renderHistoryContent = () =>
    import.meta.env.VITE_SHOW_HISTORY_PAGE === "true" ? (
      historyBoards
        .filter(matchSearchInput)
        .sort((a, b) => Number(b.favourite) - Number(a.favourite)) // move favourites to the top using the fact that true is 1 and false is 0
        .map((hb) => <HistoryCard key={hb.id} board={hb} />)
    ) : (
      <div className="history__teaser-info">
        <InfoIcon className="history__teaser-icon" />
        <p className="history__teaser-text">{t("History.teaserText")}</p>
      </div>
    );

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
          <div className="history__card-container">{renderHistoryContent()}</div>
        </section>
      </div>
    </>
  );
};
