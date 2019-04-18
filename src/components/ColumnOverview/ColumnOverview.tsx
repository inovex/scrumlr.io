import * as React from 'react';
import Stack from '../Stack';
import { default as FocusLock } from 'react-focus-lock';

import './ColumnOverview.scss';
import * as ReactDOM from 'react-dom';
import ColumnName from '../Column/ColumnName';
import Icon from '../Icon';

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
    <FocusLock>
      <div className="column-overview">
        <div className="column-overview__decorator">
          <div className="column-overview__header">
            <ColumnName title={column} count={cardsCount} />
            <button
              aria-label="Close overview"
              className="column-overview__close-button"
              onClick={() => toggleOverview()}
            >
              <Icon
                name="close-circle"
                className="column-overview__close-button-icon"
                width={48}
                height={48}
              />
            </button>
          </div>
          <div className="column-overview__stack">
            <Stack
              boardUrl={boardUrl}
              cards={cards}
              isVotingAllowed={isVotingEnabled}
              isVoteSummaryShown={isVoteSummaryShown}
            />
          </div>
        </div>
      </div>
    </FocusLock>,
    portal
  );
};

export default ColumnOverview;
