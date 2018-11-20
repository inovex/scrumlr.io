import * as cx from 'classnames';
import * as React from 'react';

import './Stack.scss';

import { Card as CardModel } from '../../types';
import Card from '../Card';
import Deferred from '../Deferred';

export interface StackProps {
  boardUrl: string;
  cards: CardModel[];
  isVotingAllowed: boolean;
  isVoteSummaryShown: boolean;
  className?: string;
}
class Stack extends React.Component<StackProps, {}> {
  renderCard(card: CardModel) {
    return (
      <Card
        key={`card-${card.id}`}
        boardId={this.props.boardUrl}
        card={card}
        votable={this.props.isVotingAllowed}
        showVotes={this.props.isVoteSummaryShown}
      >
        <Deferred value={card.text} iv={card.iv} />
      </Card>
    );
  }

  render() {
    return (
      <ul className={cx('stack', this.props.className)}>
        {this.props.cards.map(card => this.renderCard(card))}
      </ul>
    );
  }
}

export default Stack;
