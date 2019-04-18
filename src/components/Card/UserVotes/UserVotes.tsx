import * as React from 'react';

import { AddDot, DownvoteDot } from '../Dot';
import './UserVotes.scss';

export interface UserVotesProps {
  onDownvote: () => void;
  onUpvote: () => void;
  votes?: number;
}

const defaultProps: Partial<UserVotesProps> = {
  votes: 0
};

export class UserVotes extends React.Component<UserVotesProps, {}> {
  static defaultProps: Partial<UserVotesProps> = defaultProps;

  renderDownvote(votes?: number) {
    return (
      <DownvoteDot onClick={() => this.props.onDownvote()}>{votes}</DownvoteDot>
    );
  }

  render() {
    const { votes = 0 } = this.props;

    return (
      <span className="user-votes">
        {votes > 0 && this.renderDownvote(votes)}
        <AddDot onClick={() => this.props.onUpvote()} />
      </span>
    );
  }
}

export default UserVotes;
