import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Dialog} from "components/Dialog";
import {useNavigate} from "react-router";
import {useAppDispatch, useAppSelector} from "store";
import {Toggle} from "components/Toggle";
import {getNumberFromStorage, saveToStorage, getFromStorage} from "utils/storage";
import {CUMULATIVE_VOTING_DEFAULT_STORAGE_KEY, CUSTOM_NUMBER_OF_VOTES_STORAGE_KEY} from "constants/storage";
import {Plus, Minus} from "components/Icon";
import "./VotingDialog.scss";
import {closeVoting, createVoting} from "store/features";

export const VotingDialog = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const isAdmin = useAppSelector((state) => state.participants?.self?.role === "OWNER" || state.participants?.self?.role === "MODERATOR");
  const voting = useAppSelector((state) => state.votings.open?.id);

  const cumulativeVotingStorage = getFromStorage(CUMULATIVE_VOTING_DEFAULT_STORAGE_KEY);
  const cumulativeVotingDefault = !(typeof cumulativeVotingStorage !== "undefined" && cumulativeVotingStorage !== null && cumulativeVotingStorage === "false");
  const [allowCumulativeVoting, setAllowCumulativeVoting] = useState(cumulativeVotingDefault);
  const [numberOfVotes, setNumberOfVotes] = useState(getNumberFromStorage(CUSTOM_NUMBER_OF_VOTES_STORAGE_KEY, 5));

  if (!isAdmin) {
    navigate("..");
  }

  const startVoting = () => {
    dispatch(
      createVoting({
        voteLimit: numberOfVotes,
        showVotesOfOthers: false,
        allowMultipleVotes: allowCumulativeVoting,
      })
    );
    saveToStorage(CUSTOM_NUMBER_OF_VOTES_STORAGE_KEY, String(numberOfVotes));
    saveToStorage(CUMULATIVE_VOTING_DEFAULT_STORAGE_KEY, String(allowCumulativeVoting));
    navigate("..");
  };

  const stopVoting = () => {
    dispatch(closeVoting(voting!));
    navigate("..");
  };

  return (
    <Dialog className="voting-dialog accent-color__planning-pink" title={t("VoteConfigurationButton.label")} onClose={() => navigate("..")}>
      {voting ? (
        <button className="voting-dialog__start-button" data-testid="voting-dialog__stop-button" onClick={() => stopVoting()}>
          <label>{t("VoteConfigurationButton.stopVoting")}</label>
        </button>
      ) : (
        <>
          <button className="dialog__button" data-testid="voting-dialog__cumulative-voting-button" onClick={() => setAllowCumulativeVoting((state) => !state)}>
            <label>{t("VoteConfigurationButton.allowMultipleVotesPerNote")}</label>
            <Toggle active={allowCumulativeVoting} className="voting-dialog__toggle" />
          </button>
          <div className="dialog__button">
            <label>{t("VoteConfigurationButton.numberOfVotes")}</label>
            <div className="voting-dialog__votes-controls">
              <button
                onClick={() => setNumberOfVotes((prev) => Math.max(--prev, 1))}
                className="voting-dialog__vote-button"
                data-testid="voting-dialog__minus-button"
                aria-label={t("VoteConfigurationButton.decreaseVotes")}
              >
                <Minus />
              </button>
              <label className="voting-dialog__vote-label">{numberOfVotes}</label>
              <button
                onClick={() => setNumberOfVotes((prev) => Math.min(++prev, 99))}
                className="voting-dialog__vote-button"
                data-testid="voting-dialog__plus-button"
                aria-label={t("VoteConfigurationButton.increaseVotes")}
              >
                <Plus />
              </button>
            </div>
          </div>
          <button className="voting-dialog__start-button" data-testid="voting-dialog__start-button" onClick={() => startVoting()}>
            <label>{t("VoteConfigurationButton.startVoting")}</label>
          </button>
        </>
      )}
    </Dialog>
  );
};
