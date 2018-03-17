import * as React from 'react';
import { RetroMode } from '../../constants/mode';
const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

import './StartButton.css';
import Icon from '../Icon';
import { DEFAULT_RETRO_MODE } from '../../constants/Retrospective';

const newButton = require('./new.svg');

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
    label: 'Simple Retro'
  },
  startStopContinue: {
    label: 'Start, Stop, Continue'
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
        className="start-button__dropdown-toggle"
        onClick={this.toggleSelectionMenu}
      >
        <Icon name="more" />
        <img src={newButton} className="start-button__dropdown-toggle-button" />
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
              <button onClick={this.selectRetroMode(retroMode)}>
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
