import * as React from 'react';
import * as cx from 'classnames';

import './PhaseMenu.css';
import Icon from '../Icon';
import {
  getPhaseConfiguration,
  RETRO_PHASES_MAX_INDEX
} from '../../constants/Retrospective';
import ReactTooltip = require('react-tooltip');

export interface PhaseMenuProps {
  admin: boolean;
  guidedPhase: number;
  onPrevPhase: () => void;
  onNextPhase: () => void;
}

export class PhaseMenu extends React.Component<PhaseMenuProps, {}> {
  render() {
    const { admin, guidedPhase, onPrevPhase, onNextPhase } = this.props;

    const prevPhaseName =
      guidedPhase > 0 ? getPhaseConfiguration(guidedPhase - 1).name : undefined;
    const nextPhaseName =
      guidedPhase < RETRO_PHASES_MAX_INDEX
        ? getPhaseConfiguration(guidedPhase + 1).name
        : undefined;

    const phaseDescription = getPhaseConfiguration(guidedPhase).description;

    return (
      <div className={cx('phase-menu')}>
        <span className="phase-menu__navigation">
          {admin &&
            <button
              className="phase-menu__phase-button"
              aria-label="Go to previous phase"
              disabled={guidedPhase <= 0}
              onClick={onPrevPhase}
              data-tip={
                prevPhaseName
                  ? `Back to previous phase ${prevPhaseName.toUpperCase()}`
                  : undefined
              }
              data-for="prev-phase-button"
            >
              {prevPhaseName &&
                <ReactTooltip
                  id="prev-phase-button"
                  place="bottom"
                  effect="solid"
                  delayShow={500}
                />}
              <Icon
                name="circle-arrow-left"
                className="phase-menu__phase-button-icon"
                aria-hidden="true"
              />
            </button>}

          {admin &&
            <button
              className="phase-menu__phase-button"
              aria-label="Go to next phase"
              disabled={guidedPhase >= RETRO_PHASES_MAX_INDEX}
              onClick={onNextPhase}
              data-tip={
                nextPhaseName
                  ? `Move to next phase ${nextPhaseName.toUpperCase()}`
                  : undefined
              }
              data-for="next-phase-button"
            >
              {nextPhaseName &&
                <ReactTooltip
                  id="next-phase-button"
                  place="bottom"
                  effect="solid"
                  delayShow={500}
                />}
              <Icon
                name="circle-arrow-right"
                className="phase-menu__phase-button-icon"
                aria-hidden="true"
              />
            </button>}

          <span data-tip={phaseDescription} data-for="phase-description">
            Phase {guidedPhase + 1}
          </span>
          <ReactTooltip
            id="phase-description"
            place="bottom"
            effect="solid"
            delayShow={500}
          />
          <span className="phase-menu__dash" aria-hidden="true" />
          <span
            className="phase-menu__current-phase-name"
            data-tip={phaseDescription}
            data-for="phase-name-description"
          >
            {getPhaseConfiguration(guidedPhase).name}
          </span>
          <ReactTooltip
            id="phase-name-description"
            place="bottom"
            effect="solid"
            delayShow={500}
          />
        </span>
      </div>
    );
  }
}

export default PhaseMenu;
