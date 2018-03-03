import { dataToJS, getFirebase } from 'react-redux-firebase';
import {
  OwnFocusedCardComponentProps,
  StateFocusedCardComponentProps
} from './FocusedCardComponent';
import { BoardCards, Card, StoreState } from '../../../types';
import Raven = require('raven-js');

const getRootCard = (
  cardId: string,
  cards: BoardCards,
  hasParent: boolean = false
): string | undefined => {
  if (cards[cardId].parent) {
    if (cardId !== cards[cardId].parent) {
      return getRootCard(cards[cardId].parent as string, cards, true);
    }
  }
  if (hasParent) {
    return cardId;
  }
  return undefined;
};

const getCardsInTheStack = (parentId: string, cards: BoardCards): Card[] => {
  return Object.keys(cards)
    .filter(key => getRootCard(key, cards) === parentId)
    .map(key => Object.assign({}, cards[key], { id: key }));
};

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnFocusedCardComponentProps
): StateFocusedCardComponentProps => {
  const boardCards: BoardCards = dataToJS(
    state.fbState,
    `${ownProps.boardUrl}/cards`,
    {}
  );

  const cardsInStack = getCardsInTheStack(
    ownProps.focused.id as string,
    boardCards
  );
  cardsInStack.unshift(ownProps.focused);

  const setParentOfCard = (cardId: string, parentId: string | null) => {
    const card: Card = dataToJS(
      state.fbState,
      `${ownProps.boardUrl}/cards/${cardId}`,
      {}
    );

    getFirebase().ref(`${ownProps.boardUrl}/cards/${cardId}`).update({
      ...card,
      parent: parentId
    });
  };

  const setRootCard = (index: number) => {
    if (index > 0 && index < cardsInStack.length) {
      const oldRoot = cardsInStack[0];
      const newRoot = cardsInStack[index];

      setParentOfCard(newRoot.id as string, null);
      setParentOfCard(oldRoot.id as string, newRoot.id as string);

      getFirebase()
        .ref(`${ownProps.boardUrl}/config/focusedCardId`)
        .set(newRoot.id)
        .catch((err: Error) => {
          Raven.captureMessage('Could not set focus on card', {
            extra: {
              reason: err.message,
              boardId: ownProps.boardUrl,
              cardId: newRoot.id
            }
          });
        });
    }
  };

  return {
    cards: cardsInStack,
    setRootCard
  };
};
