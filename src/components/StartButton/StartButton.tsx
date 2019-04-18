import * as React from 'react';
import { RetroMode } from '../../constants/mode';
const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

import './StartButton.scss';
import Icon from '../Icon';
import { DEFAULT_RETRO_MODE } from '../../constants/Retrospective';

export interface StartButtonProps {
  onStart: (retroMode: RetroMode) => void;
}

export interface StartButtonState {
  selectedMode: RetroMode;
  isSelectionMenuOpened: boolean;
}

const availableRetroModes = {
  lean: {
    label: 'Lean Coffee'
  },
  positiveNegative: {
    label: 'Simple Retro (Delta+)'
  },
  startStopContinue: {
    label: 'Start, Stop, Continue'
  },
  madSadGlad: {
    label: 'Mad, Sad, Glad'
  },
  kalm: {
    label: 'KALM (Keep, Add, Less, More)'
  }
};

export class StartButton extends React.Component<
  StartButtonProps,
  StartButtonState
> {
  constructor(props: StartButtonProps) {
    super(props);
    this.state = {
      selectedMode: DEFAULT_RETRO_MODE,
      isSelectionMenuOpened: false
    };
  }

  closeSelectionMenu = () => {
    this.setState({ isSelectionMenuOpened: false });
  };

  toggleSelectionMenu = () => {
    this.setState(state => ({
      isSelectionMenuOpened: !state.isSelectionMenuOpened
    }));
  };

  selectRetroMode = (retroMode: RetroMode) => () => {
    this.setState({ selectedMode: retroMode });
  };

  render() {
    const { onStart } = this.props;
    const { selectedMode, isSelectionMenuOpened } = this.state;

    const selectedModeConfiguration = availableRetroModes[selectedMode];

    const dropdownButton = (
      <button
        aria-label="Board mode selection dropdown"
        className="start-button__dropdown-toggle"
        onClick={this.toggleSelectionMenu}
      >
        <Icon name="more" />
      </button>
    );

    const ddMenuProps = {
      isOpen: isSelectionMenuOpened,
      close: this.closeSelectionMenu,
      toggle: dropdownButton,
      align: 'right',
      closeOnInsideClick: true
    };

    return (
      <div className="start-button">
        <button
          aria-label="Start session"
          className="start-button__start"
          onClick={() => onStart(selectedMode)}
        >
          <h1 className="start-button__start-label">Start</h1>
          <span className="start-button__start-mode">
            {selectedModeConfiguration.label}
          </span>
        </button>

        <DropdownMenu
          {...ddMenuProps}
          className="start-button__dropdown-wrapper"
        >
          {Object.keys(availableRetroModes).map((retroMode: RetroMode) => (
            <li key={retroMode}>
              <button
                onClick={this.selectRetroMode(retroMode)}
                aria-label={`Mode: ${availableRetroModes[retroMode].label}`}
              >
                {availableRetroModes[retroMode].label}
              </button>
            </li>
          ))}
        </DropdownMenu>
      </div>
    );
  }
}

export default StartButton;
