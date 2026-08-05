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
  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous);
  const allowAnonymousHistory = useAppSelector((state) => state.view.allowAnonymousHistory);

  const canViewHistory = !isAnonymous || (allowAnonymousHistory && false);

  useEffect(() => {
    if (historyBoards.length === 0) dispatch(getBoards());
  }, [dispatch, historyBoards.length]);

  const matchSearchInput = (historyBoard: HistoryBoard) => historyBoard.name.toLowerCase().includes(searchBarInput.toLowerCase());

  // show history for registered users or if the respective env flag is set, otherwise an info section
  const renderHistoryContent = () =>
    canViewHistory ? (
      historyBoards
        .filter(matchSearchInput)
        .sort((a, b) => Number(b.favourite) - Number(a.favourite) || b.modifiedAt.getTime() - a.modifiedAt.getTime()) // move favourites to the top, then sort by latest modifiedAt
        .map((hb) => <HistoryCard key={hb.id} board={hb} />)
    ) : (
      <div className={"history__require-registered-user"}>
        <div className="history__require-registered-user-info">
          <InfoIcon className="history__require-registered-user-icon" />
          <p className="history__require-registered-user-text">{t("History.requireRegisteredAccount")}</p>
        </div>
        <p className="history__require-registered-user-register-area">REGISTER BUTTON PLACEHOLDER</p>
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
