import * as React from 'react';
import Stack from '../Stack';

import './ColumnOverview.scss';
import * as ReactDOM from 'react-dom';
import ColumnName from '../Column/ColumnName';
import Portal from '../Portal';

export interface ColumnOverviewProps {
  boardUrl: string;
  column: string;
  cardsCount: number;

  cards: any;
  isVotingEnabled: boolean;
  isVoteSummaryShown: boolean;
  toggleOverview: () => void;
}

export const ColumnOverview: React.FunctionComponent<ColumnOverviewProps> = ({
  boardUrl,
  column,
  cardsCount,
  cards,
  isVotingEnabled,
  isVoteSummaryShown,
  toggleOverview
}) => {
  // mount backdrop into separate located DOM node 'portal'
  const portal: HTMLElement = document.getElementById('portal')!;
  if (!portal) {
    throw new Error('portal element does not exist');
  }

  return ReactDOM.createPortal(
    <Portal
      className="column-overview"
      fullWidth={true}
      verticallyAlignContent="start"
      onClose={() => toggleOverview()}
    >
      <div className="column-overview__header">
        <ColumnName title={column} count={cardsCount} />
      </div>
      <div className="column-overview__stack">
        <Stack
          boardUrl={boardUrl}
          cards={cards}
          isVotingAllowed={isVotingEnabled}
          isVoteSummaryShown={isVoteSummaryShown}
        />
      </div>
    </Portal>,
    portal
  );
};

export default ColumnOverview;
