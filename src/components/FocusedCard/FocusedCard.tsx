import * as cx from 'classnames';
import * as React from 'react';
import './FocusedCard.scss';

import { Card as TCard } from '../../types';
import { mapStateToProps } from './FocusedCard.container';
import { Icon } from '../Icon';
import KeyboardNavigationHint from './KeyboardNavigationHint/KeyboardNavigationHint';
import { DropTarget } from 'react-dnd';
import { connect } from 'react-redux';
import Deferred from '../Deferred';

const Dotdotdot: React.ComponentClass<any> = require('react-dotdotdot');

export interface OwnFocusedCardProps {
  boardUrl: string;
  card: TCard;

  isRootCard: boolean;
  setAsRoot: () => void;

  showVotes: boolean;
}

export interface StateFocusedCardProps {
  onClose: () => void;
  isAdmin: boolean;
}

export type FocusedCardProps = OwnFocusedCardProps & StateFocusedCardProps;

const focusedCardTarget = {
  drop(props: FocusedCardProps) {
    return { type: 'focus', id: props.card.id };
  }
};

export interface FocusedCardState {
  stackIconHover: boolean;
}

export class FocusedCard extends React.Component<
  FocusedCardProps & {
    connectDropTarget?: (el: JSX.Element) => JSX.Element;
    isOver?: boolean;
  },
  FocusedCardState
> {
  constructor(props: FocusedCardProps) {
    super(props);
    this.state = { stackIconHover: false };
  }

  mouseEnterStackButton = () => {
    this.setState({ stackIconHover: true });
  };

  mouseLeaveStackButton = () => {
    this.setState({ stackIconHover: false });
  };

  render() {
    const { card, isAdmin, onClose, isRootCard, showVotes } = this.props;

    const stackIcon = isRootCard
      ? 'stack-top'
      : this.state.stackIconHover
        ? 'stack-hover'
        : 'stack-mid';

    const content = (
      <div
        className={cx('focus-card', `focus-card--type-${card.theme}`, {
          'focus-card--drophover': this.props.isOver
        })}
      >
        {isAdmin && (
          <button
            disabled={isRootCard}
            onClick={this.props.setAsRoot}
            className="focus-card__star-button"
            onMouseEnter={this.mouseEnterStackButton}
            onMouseLeave={this.mouseLeaveStackButton}
          >
            <Icon name={stackIcon} />
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            onClick={onClose}
            className="focus-card__close-button"
          >
            <span className="focus-card__close-button-text">CLOSE</span>
            <Icon name="close20" className="focus-card__close-button-icon" />
          </button>
        )}

        <div className="focus-card__vertical-alignment">
          <Dotdotdot clamp={3}>
            <Deferred value={card.text} iv={card.iv} />
          </Dotdotdot>
        </div>

        {isAdmin && (
          <KeyboardNavigationHint className="focus-card__navigation-hint" />
        )}

        {showVotes && (
          <span
            className={cx(
              'focus-card__number-of-votes',
              `focus-card__number-of-votes--type-${card.theme}`
            )}
          >
            {card.votes}
          </span>
        )}
      </div>
    );

    if (typeof this.props.connectDropTarget === 'function') {
      return this.props.connectDropTarget(content);
    }
    return content;
  }
}

export default connect<StateFocusedCardProps, null, OwnFocusedCardProps>(
  mapStateToProps
)(
  DropTarget<FocusedCardProps>(
    'card',
    focusedCardTarget,
    (connect: any, monitor: any) => ({
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  )(FocusedCard)
);
