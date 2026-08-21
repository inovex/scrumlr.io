import {useEffect, useState} from "react";
import {Outlet, useNavigate, useOutletContext} from "react-router";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import StanDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.svg";
import StanLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.svg";
import {InfoIcon} from "components/Icon";
import {useAppDispatch, useAppSelector} from "store";
import {HistoryBoard, getBoards} from "store/features";
import {HistoryCard} from "./HistoryCard/HistoryCard";
import {Button} from "components/Button";
import {LoadingIndicator} from "components/LoadingIndicator";
import {useDelayedLoading} from "utils/hooks/useDelayedLoading";
import "./History.scss";

export type {HistoryBoard} from "store/features";

export const History = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const {searchBarInput} = useOutletContext<{searchBarInput: string}>();

  const dispatch = useAppDispatch();
  const historyBoards = useAppSelector((state) => state.history);
  const [isLoading, setIsLoading] = useState(false);
  const showLoading = useDelayedLoading(isLoading, 200);
  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous);
  const allowAnonymousHistory = useAppSelector((state) => state.view.allowAnonymousHistory);

  const canViewHistory = !isAnonymous || allowAnonymousHistory;

  // init history boards
  useEffect(() => {
    if (canViewHistory) {
      setIsLoading(true);
      dispatch(getBoards()).finally(() => setIsLoading(false));
    }
  }, [dispatch, canViewHistory]);

  const matchSearchInput = (historyBoard: HistoryBoard) => historyBoard.name.toLowerCase().includes(searchBarInput.toLowerCase());

  const renderRequireRegisteredUser = () => (
    <div className={"history__info"}>
      <div className="history__info-container">
        <InfoIcon className="history__info-icon" />
        <p className="history__info-text">{t("History.requireRegisteredAccount")}</p>
      </div>
      <div className="history__require-registered-user-register-area">
        {/*redirect to the login screen and after and then back to here after completion.
          NOTE: possible subject to change, e.g., by replacing it with an 'upgrade account' functionality*/}
        <Button className="history__require-registered-user-register-button" onClick={() => navigate("/login", {state: {from: {pathname: "/boards/history"}}})}>
          {t("History.registerNow")}
        </Button>
      </div>
    </div>
  );

  const renderEmptyHistory = () => (
    <div className="history__info">
      <div className="history__info-container">
        <InfoIcon className="history__info-icon" />
        <p className="history__info-text">{t("History.empty")}</p>
      </div>
    </div>
  );

  // show history for registered users or if the respective env flag is set and if there are history boards, otherwise an info section
  const renderHistoryContent = () => {
    if (!canViewHistory) {
      return renderRequireRegisteredUser();
    }

    if (isLoading) {
      return showLoading ? <LoadingIndicator /> : null;
    }

    if (historyBoards.length === 0) {
      return renderEmptyHistory();
    }
    return historyBoards
      .filter(matchSearchInput)
      .sort((a, b) => Number(b.favourite) - Number(a.favourite) || new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()) // move favourites to the top, then sort by latest modifiedAt
      .map((hb) => <HistoryCard key={hb.id} board={hb} />);
  };

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
