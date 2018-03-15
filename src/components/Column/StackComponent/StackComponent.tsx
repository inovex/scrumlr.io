import * as cx from 'classnames';
import * as React from 'react';

import Component from '../Component';
import Stack from '../../Stack';
import Action from '../../Action';
import AddCard from '../../AddCard';
import { ColumnType, getTheme } from '../../../constants/Retrospective';
import { Card as CardModel } from '../../../types';

import './StackComponent.css';

export interface StackComponentProps {
  boardUrl: string;
  cards: CardModel[];
  name: string;
  type: ColumnType;
  isVotingAllowed: boolean;
  isVoteSummaryShown: boolean;
  className?: string;
}

class StackComponent extends React.Component<StackComponentProps, {}> {
  render() {
    const {
      className,
      boardUrl,
      name,
      type,
      cards,
      isVotingAllowed,
      isVoteSummaryShown
    } = this.props;

    const theme = getTheme(type);

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
          <AddCard boardId={boardUrl} name={name} type={type} />
        </Action>
      </Component>
    );
  }
}

export default StackComponent;
