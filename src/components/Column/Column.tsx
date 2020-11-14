import * as classNames from 'classnames';
import * as React from 'react';

import './Column.scss';
import { Card as CardModel } from '../../types';
import { PhaseConfiguration } from '../../constants/Retrospective';
import { mapStateToProps } from './Column.container';
import FocusedCardComponent from './FocusedCardComponent';
import StackComponent from './StackComponent';
import ColumnHeader from './ColumnHeader';
import * as ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Icon } from '../Icon';
import { connect } from 'react-redux';
import { ColumnOverview } from '../ColumnOverview';

export interface OwnColumnProps {
  boardUrl: string;
  isAdmin: boolean;
  isShowCards: boolean;

  /** The unique column id. */
  id: string;
  phase: {guidedPhase: number, config: PhaseConfiguration};

  isActive: boolean;

  hasNextColumn?: boolean;
  hasPreviousColumn?: boolean;
  onGoToNextColumn?: () => void;
  onGoToPrevColumn?: () => void;
  onUpdateColumnName: (columnId: string, newName: string) => void;
  isCompactView: boolean;

  className?: string;
}

export interface StateColumnProps {
  theme: string;
  cards: CardModel[];
  focused?: CardModel;
  isHidden: boolean;
  isExtended: boolean;
}

export type ColumnProps = OwnColumnProps & StateColumnProps;

export interface ColumnState {
  showOverview: boolean;
}

export class Column extends React.Component<ColumnProps, ColumnState> {
  state: ColumnState = {
    showOverview: false
  };

  toggleOverview = () => {
    this.setState({ showOverview: !this.state.showOverview });
  };

  onUpdateColumnName = (name: string) => {
    this.props.onUpdateColumnName(this.props.id, name);
  };

  render() {
    const {
      isAdmin,
      isActive,
      isHidden,
      isExtended,
      className,
      focused,
      id,
      phase,
      theme,
      boardUrl,
      cards,
      isCompactView
    } = this.props;

    const cardsCount = cards.filter(c => !c.parent).length;
    const column = phase.config.columns[id];

    return (
      <>
        {this.state.showOverview && (
          <ColumnOverview
            onUpdateColumnName={this.onUpdateColumnName}
            boardUrl={boardUrl}
            column={column.name}
            cardsCount={cardsCount}
            cards={cards}
            isVotingEnabled={column.voting.enabled}
            isVoteSummaryShown={column.voting.displayed}
            isAdmin={isAdmin}
            toggleOverview={this.toggleOverview}
          />
        )}
        <div
          className={classNames('column', `column--theme-${theme}`, className, {
            ['column--inactive']:
              !isActive && (focused ? focused.type !== id : true),
            ['column--hidden']: isHidden
          })}
          style={{
            flex: isExtended ? Object.keys(phase.config.columns).length - 1 : 1
          }}
        >
          {!focused && this.props.hasPreviousColumn && (
            <button
              className={classNames(
                'column__navigation',
                'column__navigation-left'
              )}
              type="button"
              onClick={this.props.onGoToPrevColumn}
              disabled={!isActive}
            >
              <Icon name="chevron-left" width={32} height={32} />
            </button>
          )}

          {!focused && this.props.hasNextColumn && (
            <button
              className={classNames(
                'column__navigation',
                'column__navigation-right'
              )}
              type="button"
              onClick={this.props.onGoToNextColumn}
              disabled={!isActive}
            >
              <Icon name="chevron-right" width={32} height={32} />
            </button>
          )}

          <ColumnHeader
            onUpdateColumnName={this.onUpdateColumnName}
            title={column.name}
            count={cardsCount}
            isAdmin={isAdmin}
            onToggleOverview={this.toggleOverview}
          />

          <ReactCSSTransitionGroup
            transitionName="column__content-animation"
            transitionEnterTimeout={600}
            transitionEnter={true}
            transitionLeave={false}
            className="column__content"
          >
            {focused && column.focus.align === 'left' && (
              <FocusedCardComponent
                isAdmin={isAdmin}
                key={focused!!.id}
                boardUrl={boardUrl}
                focused={focused}
                className="component--large"
                showVotes={column.voting.displayed}
              />
            )}

            {!isExtended && (
              <StackComponent
                boardUrl={boardUrl}
                cards={cards}
                isVotingAllowed={column.voting.enabled}
                isVoteSummaryShown={column.voting.displayed}
                columnId={id}
                column={column}
                isActive={isActive || !isCompactView}
                className={classNames('column__stack-component', {
                  ['column__stack-component--hidden']: Boolean(focused)
                })}
              />
            )}

            {focused && column.focus.align === 'right' && (
              <FocusedCardComponent
                isAdmin={isAdmin}
                key={focused!!.id}
                boardUrl={boardUrl}
                focused={focused}
                className="component--large"
                showVotes={column.voting.displayed}
              />
            )}
          </ReactCSSTransitionGroup>
        </div>
      </>
    );
  }
}

export default connect<StateColumnProps, null, OwnColumnProps>(mapStateToProps)(
  Column
);
