import {useTranslation} from "react-i18next";
import {useEffect, useState, useRef, useCallback} from "react";
import {useParams} from "react-router";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {API} from "api";
import {useAppDispatch} from "store";
import {permittedBoardAccess} from "store/features/board";
import StanLight from "assets/stan/Stan_Toilette_Light.svg?react";
import StanDark from "assets/stan/Stan_Toilette_Dark.svg?react";
import BackgroundFreeFormLight from "assets/pages/404/404_Background_light.svg?react";
import BackgroundFreeFormDark from "assets/pages/404/404_Background_dark.svg?react";
import BackgroundDetails from "assets/pages/404/Details.svg?react";
import "./RejectionPage.scss";

type RejectionPageProps = {
  status: "rejected" | "too_many_join_requests" | "banned";
};

// retry interval for banned users in milliseconds
const BANNED_RETRY_INTERVAL_MS = 30_000;

export const RejectionPage = ({status}: RejectionPageProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {boardId} = useParams<"boardId">();
  const [isRetrying, setIsRetrying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBanned = status === "banned";

  // probes the join endpoint without putting the redux store into "pending"
  // so the rejection page (and its retry button) stays mounted when the attempt fails.
  const probeRejoin = useCallback(async () => {
    if (!boardId) return;
    try {
      const result = await API.joinBoard(boardId);
      if (result.status === "ACCEPTED") {
        dispatch(permittedBoardAccess(boardId));
      }
    } catch {
      // network/temporary error: stay on the page and let the next tick try again.
    }
  }, [boardId, dispatch]);

  const tryRejoin = async () => {
    setIsRetrying(true);
    try {
      await probeRejoin();
    } finally {
      // give the user some visual feedback before re-enabling the button
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  // automatically poll for unban while banned
  useEffect(() => {
    if (!isBanned || !boardId) return undefined;

    intervalRef.current = setInterval(probeRejoin, BANNED_RETRY_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isBanned, boardId, probeRejoin]);

  return (
    <div className="rejection-page__root">
      <div className="rejection-page__background">
        <BackgroundFreeFormLight className="rejection-page__background-form rejection-page__background-form--light" />
        <BackgroundFreeFormDark className="rejection-page__background-form rejection-page__background-form--dark" />
        <BackgroundDetails className="rejection-page__background-details" />
      </div>
      <header className="rejection-page__header">
        <div className="rejection-page__logo-container">
          <ScrumlrLogo className="rejection-page__scrumlr-logo" />
        </div>
      </header>
      <main className="rejection-page__main">
        <div className="rejection-page__content">
          <div className="rejection-page__title">{t("RejectionPage.title")}</div>
          <div className="rejection-page__description">{isBanned ? t("RejectionPage.banned") : t("RejectionPage.description")}</div>
          {isBanned && <div className="rejection-page__hint">{t("RejectionPage.bannedRetryHint")}</div>}
          <div className="rejection-page__button-group">
            {isBanned && (
              <button className="rejection-page__return-button rejection-page__return-button--retry" onClick={tryRejoin} disabled={isRetrying}>
                {isRetrying ? t("RejectionPage.retrying") : t("RejectionPage.retry")}
              </button>
            )}
            <button
              className="rejection-page__return-button"
              onClick={() => {
                window.location.pathname = "/";
              }}
            >
              {t("RejectionPage.button")}
            </button>
          </div>
        </div>
        <div className="rejection-page__image-wrapper">
          <StanLight className="rejection-page__logo-stan rejection-page__logo-stan--light" />
          <StanDark className="rejection-page__logo-stan rejection-page__logo-stan--dark" />
        </div>
      </main>
    </div>
  );
};
