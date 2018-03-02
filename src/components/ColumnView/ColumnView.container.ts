import { BoardCards, BoardConfig, StoreState } from '../../types/index';
import { ColumnViewOwnProps, ColumnViewProps } from './ColumnView';
import { getVal } from 'react-redux-firebase';
import {
  ColumnType,
  getPhaseConfiguration
} from '../../constants/Retrospective';

export const mapStateToProps = (
  state: StoreState,
  ownProps: ColumnViewOwnProps
): ColumnViewProps => {
  const boardConfig: BoardConfig = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config`,
    {}
  );

  let filteredCardType: ColumnType | undefined = undefined;
  const focusedCardId = boardConfig.focusedCardId;
  if (focusedCardId) {
    const boardCards: BoardCards = getVal(
      state.fbState,
      `data/${ownProps.boardUrl}/cards`,
      {}
    );

    const focusedCard = boardCards[focusedCardId];
    filteredCardType = focusedCard.type;
  }

  return {
    phase: getPhaseConfiguration(boardConfig.guidedPhase),
    filteredCardType,
    ...ownProps
  };
};
