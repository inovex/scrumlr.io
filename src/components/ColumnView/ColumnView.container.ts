import { BoardCards, BoardConfig, StoreState } from '../../types';
import { OwnColumnViewProps, StateColumnViewProps } from './ColumnView';
import { dataToJS } from 'react-redux-firebase';
import {
  ColumnType,
  getPhaseConfiguration
} from '../../constants/Retrospective';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnColumnViewProps
): StateColumnViewProps => {
  const boardConfig: BoardConfig = dataToJS(
    state.fbState,
    `${ownProps.boardUrl}/config`,
    {}
  );

  let filteredCardType: ColumnType | undefined = undefined;
  const focusedCardId = boardConfig.focusedCardId;
  if (focusedCardId) {
    const boardCards: BoardCards = dataToJS(
      state.fbState,
      `${ownProps.boardUrl}/cards`,
      {}
    );

    const focusedCard = boardCards[focusedCardId];
    filteredCardType = focusedCard.type;
  }

  return {
    phase: getPhaseConfiguration(boardConfig.guidedPhase),
    filteredCardType
  };
};
