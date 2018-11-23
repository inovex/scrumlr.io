import * as React from 'react';
import { range } from 'lodash';

import { AddDot, DownvoteDot } from '../Dot';
import './UserVotes.scss';

export interface UserVotesProps {
  onDownvote: () => void;
  onUpvote: () => void;
  votes?: number;
  maxDotsShown?: number;
}

const defaultProps: Partial<UserVotesProps> = {
  votes: 0,
  maxDotsShown: 5
};

export class UserVotes extends React.Component<UserVotesProps, {}> {
  static defaultProps: Partial<UserVotesProps> = defaultProps;

  renderDownvote(votes?: number) {
    return (
      <DownvoteDot onClick={() => this.props.onDownvote()}>{votes}</DownvoteDot>
    );
  }

  renderDots() {
    const { votes = 0, maxDotsShown } = this.props;

    if (maxDotsShown && votes && votes > maxDotsShown) {
      return this.renderDownvote(votes);
    }

    return (
      <ul className="user-votes__dots">
        {range(votes).map((x, i) => (
          <li key={votes - i} className="user-votes__dots-item">
            {this.renderDownvote()}
          </li>
        ))}
      </ul>
    );
  }

  render() {
    return (
      <span className="user-votes">
        {this.renderDots()}
        <AddDot onClick={() => this.props.onUpvote()} />
      </span>
    );
  }
}

export default UserVotes;
