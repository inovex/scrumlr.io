import * as React from 'react';

import './SettingsModal.scss';
import Input from '../../Input';
import Modal from '../Modal';
import getRandomName from '../../../constants/Name';
import Checkbox from '../../Checkbox';
import Icon from 'components/Icon';

export interface SettingsModalProps {
  isAdmin: boolean;
  boardName?: string;
  username?: string;
  email?: string;
  isAnonymous: boolean;
  onClose: () => void;
  onChangeBoardName: (name: string) => void;
  onChangeUsername: (name: string) => void;
  onToggleShowAuthor: () => void;
  onToggleShowCards: () => void;
  onDeleteBoard: () => void;
  isShowAuthor: boolean;
  isShowCards: boolean;
}

export class SettingsModal extends React.Component<SettingsModalProps, {}> {
  handleDeleteBoard = () => {
    const warning =
      'Are you sure you want to delete the board? This action cannot be undone.';
    if (window.confirm(warning)) {
      this.props.onDeleteBoard();
    }
  };

  render() {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${now.getMonth() +
      1}/${now.getDate()}`;

    return (
      <Modal onClose={this.props.onClose} onSubmit={this.props.onClose}>
        <h2 className="modal__headline">Settings</h2>

        {this.props.isAdmin && (
          <>
            <Input
              id="modal__board-name-input"
              label="Name"
              description="The name of this session"
              invertPlaceholder={false}
              focusTheme="mint"
              showUnderline={true}
              placeholder={`Retrospective ${formattedDate}`}
              onChange={(e: any) =>
                this.props.onChangeBoardName(e.target.value)
              }
              defaultValue={this.props.boardName}
              className="settings-modal__input"
            />
            <Checkbox
              onChange={this.props.onToggleShowAuthor}
              checked={Boolean(this.props.isShowAuthor)}
              className="settings-modal__show-author-checkbox"
            >
              Show author of cards
            </Checkbox>
            <Checkbox
              onChange={this.props.onToggleShowCards}
              checked={Boolean(this.props.isShowCards)}
              className="settings-modal__show-author-checkbox"
            >
              Show everyone's cards during Write phase
            </Checkbox>
          </>
        )}

        <Input
          id="modal__username-input"
          label="Username"
          description="Your username will be displayed to the other session members."
          invertPlaceholder={false}
          focusTheme="mint"
          showUnderline={true}
          placeholder={getRandomName()}
          onChange={(e: any) => this.props.onChangeUsername(e.target.value)}
          defaultValue={this.props.username}
          className="settings-modal__input"
        />

        {this.props.isAdmin && (
          <button
            className="settings-modal__delete-button"
            aria-label="Delete this board"
            onClick={this.handleDeleteBoard}
          >
            <Icon
              name="trash"
              className="delete-button__icon"
              aria-hidden="true"
              width={16}
              height={16}
            />
            Delete this board
          </button>
        )}
      </Modal>
    );
  }
}

export default SettingsModal;
