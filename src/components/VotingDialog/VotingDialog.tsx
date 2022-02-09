import {VFC, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Toggle} from "components/Toggle";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {useTranslation} from "react-i18next";
import "./VotingDialog.scss";
import {Dialog} from "components/Dialog";
import {ReactComponent as PlusIcon} from "assets/icon-plus.svg";
import {ReactComponent as MinusIcon} from "assets/icon-minus.svg";
import Parse from "parse";

export const VotingDialog: VFC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const boardId = useAppSelector((state) => state.board.data!.id);
  const adminUsers = useAppSelector((state) => state.users.admins);
  const activeVoting = useAppSelector((state) => state.board.data!.voting === "active");
  const [allowCumulativeVoting, setAllowCumulativeVoting] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);
  const [numberOfVotes, setNumberOfVotes] = useState(5);
  const [startPositionX, setStartPositionX] = useState(0);

  useEffect(() => {
    const onUpdate = (e: MouseEvent) => {
      if (startPositionX) {
        setNumberOfVotes(Math.max(1, Math.abs(Math.floor((e.clientX - startPositionX) / 10))));
      }
    };

    const onEnd = () => {
      setStartPositionX(0);
    };

    document.addEventListener("mousemove", onUpdate);
    document.addEventListener("mouseup", onEnd);
    return () => {
      document.removeEventListener("mousemove", onUpdate);
      document.removeEventListener("mouseup", onEnd);
    };
  }, [startPositionX]);

  if (adminUsers == null || adminUsers.length === 0) {
    return null;
  }
  if (adminUsers.find((user) => user.id === Parse.User.current()!.id) == null) {
    navigate("..");
  }

  const startVoting = () => {
    store.dispatch(
      ActionFactory.addVoteConfiguration({
        boardId,
        voteLimit: numberOfVotes,
        showVotesOfOtherUsers: !anonymousVoting,
        allowMultipleVotesPerNote: allowCumulativeVoting,
      })
    );
    store.dispatch(ActionFactory.editBoard({id: boardId, voting: "active"}));
    navigate("..");
  };

  const stopVoting = () => {
    store.dispatch(ActionFactory.editBoard({id: boardId, voting: "disabled"}));
    navigate("..");
  };
  const cancelVoting = () => {
    store.dispatch(ActionFactory.cancelVoting(boardId));
    navigate("..");
  };

  return (
    <Dialog title={t("VoteConfigurationButton.label")} onClose={() => navigate("..")}>
      {activeVoting ? (
        <>
          <button className="voting-dialog__start-button" data-testid="voting-dialog__cancel-button" onClick={() => cancelVoting()}>
            <label>{t("VoteConfigurationButton.cancelVoting")}</label>
          </button>
          <button className="voting-dialog__start-button" data-testid="voting-dialog__stop-button" onClick={() => stopVoting()}>
            <label>{t("VoteConfigurationButton.stopVoting")}</label>
          </button>
        </>
      ) : (
        <>
          <button className="dialog__button" data-testid="voting-dialog__cumulative-voting-button" onClick={() => setAllowCumulativeVoting((state) => !state)}>
            <label>{t("VoteConfigurationButton.allowMultipleVotesPerNote")}</label>
            <Toggle active={allowCumulativeVoting} className="voting-dialog__toggle" />
          </button>
          <button className="dialog__button" data-testid="voting-dialog__anonymous-voting-button" onClick={() => setAnonymousVoting((state) => !state)}>
            <label>{t("VoteConfigurationButton.showVotesOfOthers")}</label>
            <Toggle active={anonymousVoting} className="voting-dialog__toggle" />
          </button>
          <div className="dialog__button">
            <label>{t("VoteConfigurationButton.numberOfVotes")}</label>
            <button onClick={() => setNumberOfVotes((prev) => Math.max(--prev, 0))} className="voting-dialog__vote-button" data-testid="voting-dialog__minus-button">
              <MinusIcon />
            </button>
            <label className="voting-dialog__vote-label" onMouseDown={(e) => setStartPositionX(e.clientX)}>
              {numberOfVotes}
            </label>
            <button onClick={() => setNumberOfVotes((prev) => Math.min(++prev, 99))} className="voting-dialog__vote-button" data-testid="voting-dialog__plus-button">
              <PlusIcon />
            </button>
          </div>
          <button className="voting-dialog__start-button" data-testid="voting-dialog__start-button" onClick={() => startVoting()}>
            <label>{t("VoteConfigurationButton.startVoting")}</label>
          </button>
        </>
      )}
    </Dialog>
  );
};
