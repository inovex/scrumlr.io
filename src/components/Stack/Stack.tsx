import * as cx from 'classnames';
import * as React from 'react';

import './Stack.css';

import { Card as CardModel } from '../../types';
import Card from '../Card';

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
        {card.text}
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
