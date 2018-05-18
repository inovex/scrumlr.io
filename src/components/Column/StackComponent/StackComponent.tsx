import * as cx from 'classnames';
import * as React from 'react';

import Component from '../Component';
import Stack from '../../Stack';
import Action from '../../Action';
import AddCard from '../../AddCard';
import { Column, getTheme } from '../../../constants/Retrospective';
import { Card as CardModel } from '../../../types';

import './StackComponent.css';

export interface StackComponentProps {
  boardUrl: string;
  cards: CardModel[];
  column: Column;
  isVotingAllowed: boolean;
  isVoteSummaryShown: boolean;
  className?: string;
  isActive: boolean;
}

class StackComponent extends React.Component<StackComponentProps, {}> {
  render() {
    const {
      className,
      boardUrl,
      column,
      cards,
      isVotingAllowed,
      isVoteSummaryShown,
      isActive
    } = this.props;

    const theme = getTheme(column.type);

    return (
      <Component
        className={cx(
          'stack-component',
          `stack-component--theme-${theme}`,
          className
        )}
      >
        <Stack
          boardUrl={boardUrl}
          cards={cards}
          isVotingAllowed={isVotingAllowed}
          isVoteSummaryShown={isVoteSummaryShown}
          className="stack-component__stack"
        />
        <Action theme={theme}>
          <AddCard boardId={boardUrl} column={column} disabled={!isActive} />
        </Action>
      </Component>
    );
  }
}

export default StackComponent;
