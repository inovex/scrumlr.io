import * as classNames from 'classnames';
import * as React from 'react';

import './Column.css';
import { Card as CardModel } from '../../types';
import {
  ColumnType,
  RetrospectivePhaseConfiguration
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
  type: ColumnType;
  phase: RetrospectivePhaseConfiguration;

  isActive: boolean;

  hasNextColumn?: boolean;
  hasPreviousColumn?: boolean;
  onGoToNextColumn?: () => void;
  onGoToPrevColumn?: () => void;

  className?: string;
}

export interface StateColumnProps {
  title: string;
  theme: string;
  cards: CardModel[];
  focused?: CardModel;
  isHidden: boolean;

  isVotingAllowed: boolean;
  isVoteSummaryShown: boolean;
  isSortedByVotes: boolean;
  isSummary: boolean;
}

export type ColumnProps = OwnColumnProps & StateColumnProps;

export class Column extends React.Component<ColumnProps, {}> {
  render() {
    const {
      isActive,
      isHidden,
      title,
      className,
      focused,
      type,
      theme,
      isSummary,
      boardUrl,
      cards,
      isVotingAllowed,
      isVoteSummaryShown,
      phase
    } = this.props;

    const cardsCount = cards.filter(c => !c.parent).length;

    return (
      <div
        className={classNames('column', `column--theme-${theme}`, className, {
          'column--inactive':
            !isActive && (focused ? focused.type !== type : true),
          'column--hidden': type !== 'actions' && isHidden,
          'column--extended': type !== 'actions' && focused && isSummary
        })}
      >
        {!focused &&
          this.props.hasPreviousColumn &&
          <button
            className={classNames(
              'column__navigation',
              'column__navigation-left'
            )}
            type="button"
            onClick={this.props.onGoToPrevColumn}
          >
            <Icon name="chevron-left" width={48} height={48} />
          </button>}

        {!focused &&
          this.props.hasNextColumn &&
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
          </button>}

        <Title count={cardsCount}>
          {title}
        </Title>

        <ReactCSSTransitionGroup
          transitionName="column__content-animation"
          transitionEnterTimeout={600}
          transitionEnter={true}
          transitionLeave={false}
          className="column__content"
        >
          {type === 'negative' &&
            focused &&
            <FocusedCardComponent
              key={focused.id}
              boardUrl={boardUrl}
              focused={focused}
              isSummary={isSummary}
              className="component--large"
              showVotes={phase.showVotes}
            />}

          {(!isSummary || !focused) &&
            <StackComponent
              boardUrl={boardUrl}
              cards={cards}
              isVotingAllowed={isVotingAllowed}
              isVoteSummaryShown={isVoteSummaryShown}
              type={type}
              className={classNames('column__stack-component', {
                ['column__stack-component--hidden']: Boolean(focused)
              })}
            />}

          {type === 'positive' &&
            focused &&
            <FocusedCardComponent
              key={focused.id}
              boardUrl={boardUrl}
              focused={focused}
              isSummary={isSummary}
              className="component--large"
              showVotes={phase.showVotes}
            />}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default connect<StateColumnProps, null, OwnColumnProps>(mapStateToProps)(
  Column
);
