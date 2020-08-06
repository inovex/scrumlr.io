import * as React from 'react';

import { CardProps } from '../Card';
import { Card as TCard } from '../../../types';
import Footer from '../Footer';

import './Details.scss';
import Icon from '../../Icon';
import Deferred from '../../Deferred';
import IconButton from '../../IconButton';
import Avatar from '../../Avatar';
import Portal from '../../Portal';

export interface DetailsProps extends CardProps {
  editable: boolean;
  onClose: () => void;
}

export class Details extends React.Component<DetailsProps, {}> {
  handleBlur = (e: React.FormEvent<any>) => {
    const { textContent } = e.target as any;
    const { id, onUpdateText } = this.props;
    onUpdateText(id, textContent, this.props.card.iv);
  };

  render() {
    const {
      id,
      children,
      onRemove,
      onDownvote,
      onUpvote,
      onCardUnstack,
      onClose,
      votable,
      ownVotes,
      votes,
      deletable,
      showVotes
    } = this.props;

    const cardsInStack = this.props.getCardsInTheStack();
    const isActionCard = this.props.card.type === 'actions';

    const deleteIcon = (id: string) => {
      return (
        <li key="delete" className="card-details__option">
          <IconButton
            icon={
              <Icon
                name="trash"
                aria-hidden="true"
                className="card-details__options-icon"
              />
            }
            aria-label="Delete this card"
            onClick={(e: React.FormEvent<HTMLLIElement>) => {
              onRemove(id);
              onClose();
            }}
          >
            Delete
          </IconButton>
        </li>
      );
    };

    const unstackIcon = (id: string) => {
      return (
        <li key="unstack" className="card-details__option">
          <IconButton
            icon={
              <Icon
                name="stack-mid"
                aria-hidden="true"
                className="card-details__options-icon"
              />
            }
            aria-label="Unstack this card"
            onClick={(e: React.FormEvent<HTMLLIElement>) => {
              onCardUnstack(id);
              onClose();
            }}
          >
            Unstack
          </IconButton>
        </li>
      );
    };

    return (
      <Portal onClose={() => onClose()} verticallyAlignContent="start">
        <div className="card_details__card">
          <blockquote
            className="card-details__card-text"
            contentEditable={this.props.editable}
            suppressContentEditableWarning={true}
            onBlur={this.handleBlur}
          >
            {children}
          </blockquote>

          <Footer
            votable={isActionCard ? false : votable}
            ownVotes={isActionCard ? 0 : ownVotes}
            onDownvote={() => onDownvote(id)}
            onUpvote={() => onUpvote(id)}
            votes={isActionCard ? null : showVotes || votable ? votes : null}
          >
            {this.props.isShowAuthor && (
              <>
                <Avatar
                  user={{
                    name: this.props.author.name || '',
                    image: this.props.author.image || undefined
                  }}
                  className="card__avatar"
                />
                <span className="card__author">{this.props.author.name}</span>
              </>
            )}
          </Footer>

          <aside>
            <ul className="card-details__options">
              {!isActionCard && this.props.isFocusable && (
                <li key="share" className="card-details__option">
                  <IconButton
                    icon={
                      <Icon
                        name="focus"
                        aria-hidden="true"
                        className="card-details__options-icon"
                      />
                    }
                    aria-label="Share this card for all"
                    onClick={() => {
                      onClose();
                      this.props.onFocus(this.props.id);
                    }}
                  >
                    Share
                  </IconButton>
                </li>
              )}
              {deletable && deleteIcon(id)}
              {deletable && cardsInStack.length > 0 && unstackIcon(id)}
            </ul>
          </aside>
        </div>

        {cardsInStack.length > 0 && (
          <ul className="card-details__stack">
            {cardsInStack.map((card: TCard) => (
              <li key={card.id} className="card-details__stack-item">
                <div className="card_details__card">
                  <blockquote className="card-details__card-text">
                    <Deferred value={card.text} iv={card.iv} />
                  </blockquote>

                  <Footer
                    votable={false}
                    ownVotes={0}
                    onDownvote={() => {}}
                    onUpvote={() => {}}
                    votes={null}
                  >
                    {this.props.isShowAuthor && (
                      <>
                        <Avatar
                          user={{
                            name: card.author || '',
                            image: card.image || undefined
                          }}
                          className="card__avatar"
                        />
                        <span className="card__author">{card.author}</span>
                      </>
                    )}
                  </Footer>

                  <aside>
                    <ul className="card-details__options">
                      {deletable && card.id && deleteIcon(card.id)}
                      {deletable && card.id && unstackIcon(card.id)}
                    </ul>
                  </aside>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Portal>
    );
  }
}

export default Details;
