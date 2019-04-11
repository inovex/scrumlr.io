import * as React from 'react';

import UserVotes from '../UserVotes';
import Dot, { DotSize } from '../Dot';

export interface FooterProps {
  votable: boolean;
  votes: number | null;
  ownVotes: number;
  onDownvote: () => void;
  onUpvote: () => void;
  dotSize?: DotSize;
}

const defaultProps: Partial<FooterProps> = {
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
      dotSize,
      children
    } = this.props;

    return (
      <footer className="card__footer">
        {children}
        <div className="card__footer-spacer" />
        <div>
          {votable && (
            <UserVotes
              votes={ownVotes}
              onDownvote={onDownvote}
              onUpvote={onUpvote}
            />
          )}

          {!votable && votes !== null && dotSize && (
            <Dot size={dotSize}>{votes}</Dot>
          )}
        </div>
      </footer>
    );
  }
}

export default Footer;
