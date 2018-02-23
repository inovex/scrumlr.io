import * as cx from 'classnames';
import * as React from 'react';
import { Icon } from '../Icon';

import './CardNavigation.css';

export interface CardNavigationProps {
  theme: string;

  size: number;
  currentIndex: number;

  onNext: () => void;
  onPrevious: () => void;
}

class CardNavigation extends React.Component<CardNavigationProps, {}> {
  render() {
    const { size, currentIndex, onPrevious, onNext } = this.props;

    let suffix = 'th';
    const lastIndex = Number.parseInt((currentIndex + 1).toString().slice(-1));
    const tensDigit = (currentIndex + 1) % 10;

    if (tensDigit !== 1 || currentIndex === 0) {
      if (lastIndex === 1) {
        suffix = 'st';
      } else if (lastIndex === 2) {
        suffix = 'nd';
      } else if (lastIndex === 3) {
        suffix = 'rd';
      }
    }

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < size - 1;

    return (
      <div
        className={cx(
          'card-navigation',
          `card-navigation--theme-${this.props.theme}`
        )}
      >
        <button
          className="card-navigation__button"
          aria-label="Go to previous card"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <Icon name="circle-arrow-left" className="card-navigation__icon" />
        </button>
        <span className="card-navigation__text">
          {currentIndex + 1}
          {suffix} of {size} card{size > 1 ? 's' : null}
        </span>
        <button
          className="card-navigation__button"
          aria-label="Go to next card"
          disabled={!hasNext}
          onClick={onNext}
        >
          <Icon name="circle-arrow-right" className="card-navigation__icon" />
        </button>
      </div>
    );
  }
}

export default CardNavigation;
