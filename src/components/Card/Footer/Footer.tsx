import * as React from 'react';

import UserVotes from '../UserVotes';
import Dot, { DotSize } from '../Dot';

export interface FooterProps {
  votable: boolean;
  votes: number | null;
  ownVotes: number;
  onDownvote: () => void;
  onUpvote: () => void;
  maxDotsShown?: number;
  dotSize?: DotSize;
}

const defaultProps: Partial<FooterProps> = {
  maxDotsShown: 5,
  dotSize: 'large'
};

export class Footer extends React.Component<FooterProps, {}> {
  static defaultProps: Partial<FooterProps> = defaultProps;

  render() {
    const {
      votable,
      ownVotes,
      onDownvote,
      onUpvote,
      votes,
      maxDotsShown,
      dotSize
    } = this.props;

    return (
      <footer className="card__footer">
        {votable &&
          <UserVotes
            votes={ownVotes}
            onDownvote={onDownvote}
            onUpvote={onUpvote}
            maxDotsShown={maxDotsShown}
          />}

        {!votable &&
          votes !== null &&
          dotSize &&
          <Dot size={dotSize}>
            {votes}
          </Dot>}
      </footer>
    );
  }
}

export default Footer;
