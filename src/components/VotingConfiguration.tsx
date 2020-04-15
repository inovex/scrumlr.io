import React, { ChangeEvent, useContext, useState } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../types/state';
import { completeVoting, getVotingConfiguration, resetVoting, startVoting } from '../domain/votes';
import { BoardContext } from '../routing/pages/Board';
import { FormControlLabel } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import { createSelector } from 'reselect';
import { useTranslation } from 'react-i18next';

export interface VotingConfigurationState {
    enableVoteLimit: boolean;
    voteLimit: number;
    allowMultivote: boolean;
    showVotes: boolean;
}

const stateSelector = createSelector(
    (state: ApplicationState) => state.firestore.data.boards,
    (boards) => {
        const board = Object.values(boards)[0];
        return getVotingConfiguration(board);
    }
);

export const VotingConfiguration: React.FC = () => {
    const { t } = useTranslation('votingConfiguration');
    const { boardId } = useContext(BoardContext);
    const { votingEnabled, votingCompleted } = useSelector(stateSelector);

    const [state, setState] = useState<VotingConfigurationState>({
        enableVoteLimit: false,
        voteLimit: 5,
        allowMultivote: true,
        showVotes: false
    });

    const onEnableVoteLimit = (e: ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, enableVoteLimit: e.target.checked });
    };

    const onVoteLimit = (e: ChangeEvent<{}>, value: number | number[]) => {
        setState({ ...state, voteLimit: value as number });
    };

    const onAllowMultivote = (e: ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, allowMultivote: e.target.checked });
    };

    const onShowVotes = (e: ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, showVotes: e.target.checked });
    };

    const onStartVoting = () => {
        startVoting(boardId, state.enableVoteLimit ? state.voteLimit : null, state.allowMultivote, state.showVotes);
    };

    if (votingEnabled) {
        return (
            <>
                <Button disabled={votingCompleted} onClick={() => completeVoting(boardId)}>
                    {t('controls.stop')}
                </Button>
                <Button onClick={() => resetVoting(boardId)}>{t('controls.reset')}</Button>
            </>
        );
    }

    return (
        <FormGroup>
            <FormControlLabel control={<Checkbox checked={state.enableVoteLimit} onChange={onEnableVoteLimit} />} label={t('voteLimit')} />
            <Slider disabled={!state.enableVoteLimit} value={state.voteLimit} onChange={onVoteLimit} />
            <FormControlLabel control={<Checkbox checked={state.allowMultivote} onChange={onAllowMultivote} />} label={t('allowMultivote')} />
            <FormControlLabel control={<Checkbox checked={state.showVotes} onChange={onShowVotes} />} label={t('showVotes')} />
            <Button onClick={onStartVoting}>{t('controls.start')}</Button>
        </FormGroup>
    );
};
