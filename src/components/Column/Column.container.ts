import { BoardCards, Card, StoreState } from '../../types';
import { getFirebase, getVal } from 'react-redux-firebase';
import { OwnColumnProps, StateColumnProps } from './Column';
import {
  ColumnType,
  getTheme,
  PhaseConfiguration
} from '../../constants/Retrospective';
import { Key } from 'ts-keycode-enum';
import { get } from 'lodash';
import Raven = require('raven-js');

function sortCards(cards: Card[], sortByVotes: boolean): Card[] {
  const compareTimestamps = (a: Card, b: Card) => {
    if (a.timestamp > b.timestamp) {
      return 1;
    } else if (a.timestamp < b.timestamp) {
      return -1;
    } else {
      return 0;
    }
  };

  if (sortByVotes) {
    return cards
      .sort((a, b) => {
        if (a.votes > b.votes) {
          return 1;
        } else if (a.votes < b.votes) {
          return -1;
        } else {
          return compareTimestamps(a, b);
        }
      })
      .reverse();
  } else {
    return cards.sort(compareTimestamps).reverse();
  }
}

const getColumnType = (a: string, config: PhaseConfiguration): ColumnType => {
  if (typeof a === 'undefined') {
    return 'positive';
  }

  if (isNaN(a as any)) {
    return a as ColumnType;
  }
  return config.columns[parseInt(a)].type;
};

const isEqualColumnType = (
  a: string,
  b: string,
  config: PhaseConfiguration
) => {
  if (typeof a === 'undefined' || typeof b === 'undefined') {
    return false;
  }

  let aMapped = a;
  if (isNaN(a as any)) {
    const columns = Object.keys(config.columns)
      .filter(key => config.columns[key].id === a)
      .map(key => key);
    if (columns.length === 1) {
      aMapped = columns[0];
    }
  }

  let bMapped = b;
  if (isNaN(b as any)) {
    const columns = Object.keys(config.columns)
      .filter(key => config.columns[key].id === b)
      .map(key => key);
    if (columns.length === 1) {
      bMapped = columns[0];
    }
  }

  return aMapped === bMapped;
};

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnColumnProps
): StateColumnProps => {
  const user = getVal(state.fbState, 'auth', undefined);
  const isAdmin =
    getVal(
      state.fbState,
      `data/${ownProps.boardUrl}/config/creatorUid`,
      undefined
    ) === user.uid;

  const boardCards: BoardCards = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/cards`,
    {}
  );

  const focusedCardId: string = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config/focusedCardId`,
    undefined
  );

  if (!focusedCardId) {
    window.onkeydown = () => {};
  }

  let focusTarget = undefined;

  const focusedCard = boardCards[focusedCardId];
  let focused: Card | undefined = undefined;

  if (focusedCard) {
    if (
      isEqualColumnType(focusedCard.type, ownProps.id, ownProps.phase.config)
    ) {
      focused = focusedCard;
      focused.id = focusedCardId;
    }
    focusTarget = get(
      ownProps.phase.config.columns[focusedCard.type],
      'focus.column'
    );
  }

  const showAsFocusTarget = focusedCard ? ownProps.id === focusTarget : false;
  const isFocusOrigin = focusedCard
    ? isEqualColumnType(focusedCard.type, ownProps.id, ownProps.phase.config)
    : false;

  const isHidden = focusedCard ? !isFocusOrigin && !showAsFocusTarget : false;

  const isExtended = focusedCard
    ? isFocusOrigin && ownProps.id !== focusTarget
    : false;

  let cards: Card[] = Object.keys(boardCards)
    .map(key => {
      return { id: key, ...boardCards[key] };
    })
    .filter(
      card =>
        ownProps.phase.guidedPhase !== 0 ||
        ownProps.isShowCards ||
        card.authorUid === user.uid
    )
    .filter(card =>
      isEqualColumnType(card.type, ownProps.id, ownProps.phase.config)
    )
    .filter(card => !Boolean(card.parent));

  cards = sortCards(cards, ownProps.phase.config.columns[ownProps.id].sorted);

  let cardsWithFocused: Card[] = Object.keys(boardCards)
    .map(key => {
      return { id: key, ...boardCards[key] };
    })
    .filter(card =>
      isEqualColumnType(card.type, ownProps.id, ownProps.phase.config)
    )
    .filter(
      card =>
        !Boolean(card.parent) || (focused && card.id === (focused as Card).id)
    );
  cardsWithFocused = sortCards(
    cardsWithFocused,
    ownProps.phase.config.columns[ownProps.id].sorted
  );

  function onFocusCard(cardId: string | null) {
    getFirebase()
      .ref(`${ownProps.boardUrl}/config/focusedCardId`)
      .set(cardId)
      .catch((err: Error) => {
        Raven.captureMessage('Could not set focus on card', {
          extra: {
            reason: err.message,
            uid: user.uid,
            boardId: ownProps.boardUrl,
            cardId
          }
        });
      });
  }

  if (
    focused &&
    isEqualColumnType(focused.type, ownProps.id, ownProps.phase.config)
  ) {
    const isFocusedStacked = cards.length !== cardsWithFocused.length;
    const stackToSearch = isFocusedStacked ? cardsWithFocused : cards;

    let index = stackToSearch.findIndex((card: Card) => {
      return card.id === (focused as Card).id;
    });

    if (state.app.keyboardNavigationEnabled) {
      window.onkeydown = (ev: KeyboardEvent) => {
        if (isAdmin) {
          // on escape
          if (ev.keyCode === Key.Escape) {
            if (document.getElementById('portal')!.children.length === 0) {
              onFocusCard(null);
              ev.preventDefault();
            }
          }

          // on arrow up
          if (ev.keyCode === Key.UpArrow) {
            if (index > 0) {
              onFocusCard(cards[index - 1].id as string);
              ev.preventDefault();
            }
          }

          // on arrow down
          if (ev.keyCode === Key.DownArrow) {
            if (index < cards.length - 1) {
              onFocusCard(cards[index + (isFocusedStacked ? 0 : 1)]
                .id as string);
              ev.preventDefault();
            }
          }
        }
      };
    } else {
      window.onkeydown = () => {};
    }
  }

  const theme = getTheme(
    getColumnType(
      ownProps.phase.config.columns[ownProps.id].type,
      ownProps.phase.config
    )
  );

  return {
    theme,
    cards,
    focused,
    isHidden,
    isExtended
  };
};
