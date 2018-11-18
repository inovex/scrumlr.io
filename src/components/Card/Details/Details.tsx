import * as React from 'react';

import { CardProps } from '../Card';
import { Card as TCard } from '../../../types';
import Footer from '../Footer';

import './Details.css';
import Icon from '../../Icon';

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
      votable,
      ownVotes,
      votes,
      deletable
    } = this.props;

    const cardsInStack = this.props.getCardsInTheStack();

    return (
      <div>
        <div
          className="card-details__backdrop"
          onClick={() => this.props.onClose()}
        />
        <div
          className="card_details__content"
          onClick={e => e.stopPropagation()}
        >
          <div className="card_details__card">
            <blockquote
              className="card-details__card-text"
              contentEditable={this.props.editable}
              onBlur={this.handleBlur}
            >
              {children}
            </blockquote>

            <Footer
              votable={votable}
              ownVotes={ownVotes}
              onDownvote={() => onDownvote(id)}
              onUpvote={() => onUpvote(id)}
              votes={votes}
            />

            <aside>
              <ul className="card-details__options">
                {deletable && (
                  <li
                    key="delete"
                    className="card-details__option"
                    aria-label="Delete this card"
                    onClick={(e: React.FormEvent<HTMLLIElement>) =>
                      onRemove(id)
                    }
                  >
                    <Icon
                      name="trash"
                      aria-hidden="true"
                      className="card-details__delete-icon"
                    />
                  </li>
                )}
              </ul>
            </aside>
          </div>

          {cardsInStack.length > 0 && (
            <ul className="card-details__stack">
              {cardsInStack.map((card: TCard) => (
                <li key={card.id} className="card-details__stack-item">
                  <div className="card_details__card">
                    <blockquote className="card-details__card-text">
                      {card.text}
                    </blockquote>

                    <aside>
                      <ul className="card-details__options">
                        {deletable && (
                          <li
                            key="delete"
                            aria-label="Delete this card"
                            className="card-details__option"
                            onClick={(e: React.FormEvent<HTMLLIElement>) =>
                              card.id && onRemove(card.id)
                            }
                          >
                            <Icon
                              name="trash"
                              aria-hidden="true"
                              className="card-details__delete-icon"
                            />
                          </li>
                        )}
                      </ul>
                    </aside>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default Details;
