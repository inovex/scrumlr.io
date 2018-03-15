import * as classNames from 'classnames';
import * as React from 'react';

import './Column.css';
import { Card as CardModel } from '../../types';
import {
  Column as ColumnDefinition,
  IndexedPhaseConfiguration
} from '../../constants/Retrospective';
import { mapStateToProps } from './Column.container';
import FocusedCardComponent from './FocusedCardComponent';
import StackComponent from './StackComponent';
import Title from './Title';
import * as ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Icon } from '../Icon';
import { connect } from 'react-redux';

export interface OwnColumnProps {
  boardUrl: string;

  /** The unique column type. */
  column: ColumnDefinition;
  phase: IndexedPhaseConfiguration;

  isActive: boolean;

  hasNextColumn?: boolean;
  hasPreviousColumn?: boolean;
  onGoToNextColumn?: () => void;
  onGoToPrevColumn?: () => void;

  className?: string;
}

export interface StateColumnProps {
  theme: string;
  cards: CardModel[];
  focused?: CardModel;
  isHidden: boolean;
}

export type ColumnProps = OwnColumnProps & StateColumnProps;

export class Column extends React.Component<ColumnProps, {}> {
  render() {
    const {
      isActive,
      isHidden,
      className,
      focused,
      column,
      theme,
      boardUrl,
      cards
    } = this.props;

    const cardsCount = cards.filter(c => !c.parent).length;
    // TODO get focus orientation

    return (
      <div
        className={classNames('column', `column--theme-${theme}`, className, {
          'column--inactive':
            !isActive && (focused ? focused.type !== column.type : true),
          'column--hidden': column.type !== 'actions' && isHidden,
          'column--extended': column.type !== 'actions' && focused && isSummary
        })}
      >
        {!focused &&
          this.props.hasPreviousColumn && (
            <button
              className={classNames(
                'column__navigation',
                'column__navigation-left'
              )}
              type="button"
              onClick={this.props.onGoToPrevColumn}
            >
              <Icon name="chevron-left" width={48} height={48} />
            </button>
          )}

        {!focused &&
          this.props.hasNextColumn && (
            <button
              className={classNames(
                'column__navigation',
                'column__navigation-right'
              )}
              type="button"
              onClick={this.props.onGoToNextColumn}
              disabled={!this.props.hasNextColumn}
            >
              <Icon name="chevron-right" width={48} height={48} />
            </button>
          )}

        <Title count={cardsCount}>{columnConfiguration.name}</Title>

        <ReactCSSTransitionGroup
          transitionName="column__content-animation"
          transitionEnterTimeout={600}
          transitionEnter={true}
          transitionLeave={false}
          className="column__content"
        >
          {type === 'negative' &&
            focused && (
              <FocusedCardComponent
                key={focused.id}
                boardUrl={boardUrl}
                focused={focused}
                className="component--large"
                showVotes={columnConfiguration.voting.displayed}
              />
            )}

          {(!isSummary || !focused) && (
            <StackComponent
              boardUrl={boardUrl}
              cards={cards}
              isVotingAllowed={columnConfiguration.voting.enabled}
              isVoteSummaryShown={columnConfiguration.voting.displayed}
              column={column}
              className={classNames('column__stack-component', {
                ['column__stack-component--hidden']: Boolean(focused)
              })}
            />
          )}

          {column.type === 'positive' &&
            focused && (
              <FocusedCardComponent
                key={focused.id}
                boardUrl={boardUrl}
                focused={focused}
                className="component--large"
                showVotes={columnConfiguration.voting.displayed}
              />
            )}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default connect<StateColumnProps, null, OwnColumnProps>(mapStateToProps)(
  Column
);
