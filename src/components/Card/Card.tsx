import * as classNames from 'classnames';
import * as React from 'react';
import { Component } from 'react';
import './Card.css';
import { DragSource, DropTarget } from 'react-dnd';
import { BoardProp, Card as TCard, DragAndDropProps } from '../../types';
import Details from './Details';
import Footer from './Footer';
import { mapDispatchToProps, mapStateToProps } from './Card.container';
import Icon from '../Icon/Icon';
import { throttle } from 'lodash';
import { connect } from 'react-redux';

export interface OwnCardProps extends BoardProp {
  card: TCard;
  votable: boolean;
  showVotes: boolean;
  children?: React.ReactNode;
}

export interface StateCardProps {
  id: string;
  author: { name: string | null | undefined; image?: string | null };
  column: string;
  votes: number | null;
  owner: boolean;
  editable: boolean;
  deletable: boolean;
  isAdmin: boolean;
  isFocusable: boolean;
  isFocused: boolean;
  onRemove: (id: string) => void;
  onDownvote: (id: string) => void;
  onUpvote: (id: string) => void;
  onUpdateText: (key: string, value: string, iv: string) => void;
  onShowVotes: (id: string) => void;
  onFocus: (id: string) => void;
  onCardStack: (cardSourceId: string, cardTargetId: string) => void;
  onColumnStack: (cardSourceId: string, columnTargetId: string) => void;
  stacked: boolean;
  getCardsInTheStack: () => TCard[];
  showAuthor?: boolean;
  ownVotes: number;
  isShowAuthor?: boolean;
}

export interface DispatchCardProps {
  onEditMode: (active: boolean) => void;
}

export type CardProps = OwnCardProps &
  StateCardProps &
  DispatchCardProps &
  DragAndDropProps;

export interface CardState {
  expanded: boolean;
  hasOverflow: boolean;
}

const cardTarget = {
  drop(props: CardProps) {
    return { type: 'card', id: props.id };
  }
};

const cardSource: any = {
  beginDrag(props: CardProps) {
    if (props.isAdmin) {
      return {
        id: props.id,
        column: props.column
      };
    }
    return null;
  },

  endDrag(props: CardProps, monitor: any) {
    if (props.isAdmin) {
      const item = monitor.getItem();
      const dropResult = monitor.getDropResult();

      if (dropResult) {
        if ('focus' === dropResult.type) {
          props.onCardStack(dropResult.id, item.id);
        } else if ('card' === dropResult.type) {
          props.onCardStack(item.id, dropResult.id);
        }
      }
    }
  }
};

const defaultProps: Partial<CardProps> = {
  showAuthor: true,

  // Add some default props for drag and drop.
  // This simplifies testing, in real application dnd-support is added from outside
  // the Card component.
  isDragging: false,
  connectDragSource: (el: any) => el,
  dragSource: null,
  connectDropTarget: (el: any) => el,
  isOver: false,
  canDrop: false
};

const animateScroll = throttle(
  (target: HTMLElement, start: number, finish: number) => {
    const maxIterations = 30;

    let iteration = 0;
    let currentPos = start;

    const stepOffset = (finish - start) / maxIterations;

    const scroll = () => {
      currentPos = currentPos + stepOffset;

      target.scrollTop = currentPos;
      iteration++;

      if (iteration >= maxIterations) {
        return;
      }

      requestAnimationFrame(scroll);
    };

    scroll();
  }
);

export class Card extends Component<CardProps, CardState> {
  static defaultProps: Partial<OwnCardProps> = defaultProps;

  content: HTMLElement | null;

  state: CardState = {
    expanded: false,
    hasOverflow: false
  };

  element: any;

  componentDidMount() {
    this.setState({
      ...this.state,
      hasOverflow: this.contentHasOverflowingContent()
    });
  }
  componentDidUpdate(prevProps: CardProps) {
    const hasOverflow = this.contentHasOverflowingContent();
    if (hasOverflow !== this.state.hasOverflow) {
      this.setState({ ...this.state, hasOverflow });
    }

    if (!prevProps.isFocused && this.props.isFocused) {
      const oldScrollTop = this.element.parentElement.parentElement.scrollTop;
      const newScrollTop = this.element.offsetTop - 16;

      animateScroll(
        this.element.parentElement.parentElement,
        oldScrollTop,
        newScrollTop
      );
    }
  }

  contentHasOverflowingContent = () => {
    if (!this.content) {
      return false;
    }
    return (
      this.content.offsetHeight < this.content.scrollHeight ||
      this.content.offsetWidth < this.content.scrollWidth
    );
  };

  expand = () => {
    this.setState({ ...this.state, expanded: true });
    this.props.onEditMode(true);
  };

  onDetailsCloseListener = () => {
    this.setState({ ...this.state, expanded: false });
    this.props.onEditMode(false);
  };

  render() {
    const {
      id,
      isOver,
      isDragging,
      dragSource,
      children = '',
      onDownvote,
      editable,
      onUpvote,
      onFocus,
      owner,
      votes,
      isAdmin,
      isFocusable,
      isFocused,
      votable,
      showVotes,
      ownVotes,
      card,
      connectDropTarget,
      connectDragSource,
      isShowAuthor,
      author
    } = this.props;

    const isActionCard = card.type === 'actions';

    return connectDropTarget(
      connectDragSource(
        <li
          key={id}
          id={`card-${id}`}
          className="card__root"
          ref={li => {
            this.element = li;
          }}
        >
          <div
            className={classNames('card', {
              'card--drophover': isOver && id !== dragSource.id,
              'card--disabled': isDragging,
              'card--focused': isFocused
            })}
          >
            {(owner || !isShowAuthor) && (
              <div
                className={classNames('card-indicator', {
                  'card-indicator--own': owner,
                  'card-indicator--other': !owner
                })}
              />
            )}

            {!owner &&
              isShowAuthor && (
                <span className="card__author">{author.name}</span>
              )}

            <div className="card__selection-area">
              <div className="card__admin-buttonbar">
                {!isActionCard &&
                  isFocusable && (
                    <button
                      type="button"
                      className="card__admin-button"
                      onClick={() => onFocus(id)}
                      aria-label="Select card"
                    >
                      <Icon
                        name="focus"
                        width={24}
                        height={24}
                        className="card__admin-button-icon"
                      />
                    </button>
                  )}
                {editable && (
                  <button
                    type="button"
                    className="card__admin-button"
                    onClick={this.expand}
                    aria-label="Expand card"
                  >
                    <Icon
                      name="edit"
                      width={24}
                      height={24}
                      className="card__admin-button-icon"
                    />
                  </button>
                )}
              </div>
              <blockquote
                className="card__content"
                onClick={this.expand}
                ref={content => {
                  this.content = content;
                }}
              >
                {children}

                {this.state.hasOverflow && (
                  <span className="card__more-content-indicator">&hellip;</span>
                )}
              </blockquote>
            </div>

            <Footer
              votable={isActionCard ? false : votable}
              ownVotes={isActionCard ? 0 : ownVotes}
              onDownvote={() => onDownvote(id)}
              onUpvote={() => onUpvote(id)}
              votes={isActionCard ? null : showVotes || votable ? votes : null}
            />
          </div>

          {this.props.getCardsInTheStack().length > 0 && (
            <div className="card__in-stack" aria-hidden="true" />
          )}
          {this.state.expanded && (
            <Details
              {...this.props}
              onClose={this.onDetailsCloseListener}
              editable={owner || isAdmin}
            />
          )}
        </li>
      )
    );
  }
}

export default connect<StateCardProps, DispatchCardProps, OwnCardProps>(
  mapStateToProps,
  mapDispatchToProps
)(
  DropTarget<CardProps>('card', cardTarget, (connect: any, monitor: any) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }))(
    DragSource<CardProps>('card', cardSource, (connect: any, monitor: any) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      dragSource: monitor.getItem(),
      isBeingDragged: monitor.isDragg
    }))(Card)
  )
);
