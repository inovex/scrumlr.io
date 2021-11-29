import {useState, VFC} from "react";
import {DropdownToggleButton} from "components/MenuBars/MenuItem/DropdownToggleButton";
import {TabIndex} from "constants/tabIndex";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import store, {useAppSelector} from "store";
import Dropdown from "components/Dropdown";
import "./VoteConfigurationButton.scss";
import {ActionFactory} from "store/action";
import {useTranslation} from "react-i18next";

type VoteConfigurationButtonProps = {
  tabIndex?: number;
};

export var VoteConfigurationButton: VFC<VoteConfigurationButtonProps> = function (props) {
  const {t} = useTranslation();
  const [tabable, setTabable] = useState(false);
  const [numberOfVotes, setNumberOfVotes] = useState(5);
  const [allowMultipleVotesPerNote, setAllowMultipleVotesPerNote] = useState(true);
  const [showVotesOfOthers, setShowVotesOfOthers] = useState(false);
  const state = useAppSelector((state) => ({activeVoting: state.board.data?.voting === "active", boardId: state.board.data?.id}));

  const focusOnTab = (tabIndex: number) => (tabable ? (props.tabIndex ? props.tabIndex + tabIndex : TabIndex.default) : TabIndex.disabled);

  const startVoting = () => {
    store.dispatch(
      ActionFactory.addVoteConfiguration({
        boardId: state.boardId!,
        voteLimit: numberOfVotes,
        showVotesOfOtherUsers: showVotesOfOthers,
        allowMultipleVotesPerNote,
      })
    );
    store.dispatch(ActionFactory.editBoard({id: state.boardId!, voting: "active"}));
  };
  const stopVoting = () => {
    store.dispatch(ActionFactory.editBoard({id: state.boardId!, voting: "disabled"}));
  };
  const cancelVoting = () => {
    store.dispatch(ActionFactory.cancelVoting(state.boardId!));
  };

  return (
    <DropdownToggleButton tabIndex={props.tabIndex ?? TabIndex.default} setTabable={setTabable} direction="left" label={t("VoteConfigurationButton.label")} icon={VoteIcon}>
      {state.activeVoting && (
        <Dropdown className="vote-dropdown">
          <Dropdown.Main>
            <Dropdown.ItemButton
              className="vote-dropdown__item-button"
              onClick={(_) => {
                stopVoting();
              }}
              onTouchEnd={(_) => {
                stopVoting();
              }}
            >
              <label>{t("VoteConfigurationButton.stopTimer")}</label>
            </Dropdown.ItemButton>
            <Dropdown.ItemButton
              className="vote-dropdown__item-button"
              onClick={(_) => {
                cancelVoting();
              }}
              onTouchEnd={(_) => {
                cancelVoting();
              }}
            >
              <label>{t("VoteConfigurationButton.cancelTimer")}</label>
            </Dropdown.ItemButton>
          </Dropdown.Main>
        </Dropdown>
      )}
      {!state.activeVoting && (
        <Dropdown className="vote-dropdown">
          <Dropdown.Main>
            <Dropdown.ItemButton
              className="vote-dropdown__item-button"
              onClick={(e) => {
                e.stopPropagation();
                setAllowMultipleVotesPerNote((prev) => !prev);
              }}
              onTouchEnd={() => {
                setAllowMultipleVotesPerNote((prev) => !prev);
              }}
            >
              <label>{t("VoteConfigurationButton.allowMultipleVotesPerNote")}</label>
              <div>{allowMultipleVotesPerNote ? t("VoteConfigurationButton.yes") : t("VoteConfigurationButton.no")}</div>
            </Dropdown.ItemButton>
            <Dropdown.ItemButton
              className="vote-dropdown__item-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVotesOfOthers((prev) => !prev);
              }}
              onTouchEnd={() => {
                setShowVotesOfOthers((prev) => !prev);
              }}
            >
              <label>{t("VoteConfigurationButton.showVotesOfOthers")}</label>
              <div>{!showVotesOfOthers ? t("VoteConfigurationButton.yes") : t("VoteConfigurationButton.no")}</div>
            </Dropdown.ItemButton>

            <Dropdown.ItemButton
              tabIndex={focusOnTab(4)}
              className="vote-dropdown__item-button"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <label>{t("VoteConfigurationButton.numberOfVotes")}</label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNumberOfVotes((prev) => Math.min(++prev, 99));
                }}
                onTouchEnd={() => {
                  setNumberOfVotes((prev) => Math.min(++prev, 99));
                }}
                tabIndex={focusOnTab(7)}
                className="vote-dropdown__vote-button"
              >
                +
              </button>
              <input tabIndex={focusOnTab(6)} value={numberOfVotes} onClick={(e) => e.stopPropagation()} disabled />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNumberOfVotes((prev) => Math.max(--prev, 0));
                }}
                onTouchEnd={() => {
                  setNumberOfVotes((prev) => Math.max(--prev, 0));
                }}
                tabIndex={focusOnTab(5)}
                className="vote-dropdown__vote-button"
              >
                -
              </button>
            </Dropdown.ItemButton>
          </Dropdown.Main>
          <Dropdown.Footer>
            <Dropdown.ItemButton
              className="vote-dropdown__item-button"
              onClick={(_) => {
                startVoting();
              }}
              onTouchEnd={() => {
                startVoting();
              }}
            >
              <label>{t("VoteConfigurationButton.startTimer")}</label>
            </Dropdown.ItemButton>
          </Dropdown.Footer>
        </Dropdown>
      )}
    </DropdownToggleButton>
  );
};
