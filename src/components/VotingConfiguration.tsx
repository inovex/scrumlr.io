import React, { useContext, useState } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../types/state';
import { completeVoting, resetVoting, startVoting } from '../domain/votes';
import { BoardContext } from '../routing/pages/Board';
import { FormControlLabel } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';

export interface VotingConfigurationState {
    enableVoteLimit: boolean;
    voteLimit: number;
    allowMultivote: boolean;
}

export const VotingConfiguration: React.FC = () => {
    const { boardId } = useContext(BoardContext);
    const { boards } = useSelector((state: ApplicationState) => state.firestore.data);

    const [state, setState] = useState<VotingConfigurationState>({
        enableVoteLimit: false,
        voteLimit: 5,
        allowMultivote: true
    });

    if (!boards[boardId!].voting) {
        return (
            <FormGroup>
                <FormControlLabel
                    control={<Checkbox checked={state.enableVoteLimit} onChange={(e) => setState({ ...state, enableVoteLimit: e.target.checked })} />}
                    label="Vote limit"
                />
                <Slider disabled={!state.enableVoteLimit} value={state.voteLimit} onChange={(event, value) => setState({ ...state, voteLimit: value as number })} />
                <FormControlLabel
                    control={<Checkbox checked={state.allowMultivote} onChange={(e) => setState({ ...state, allowMultivote: e.target.checked })} />}
                    label="Allow multivote"
                />
                <Button onClick={() => startVoting(boardId!, state.enableVoteLimit ? state.voteLimit : null, state.allowMultivote)}>Start voting</Button>
            </FormGroup>
        );
    }

    return (
        <>
            <Button onClick={() => completeVoting(boardId!)}>Complete voting</Button>
            <Button onClick={() => resetVoting(boardId!)}>Reset voting</Button>
        </>
    );
};
