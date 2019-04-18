import * as React from 'react';

import './SettingsModal.scss';
import Input from '../../Input';
import Modal from '../Modal';
import getRandomName from '../../../constants/Name';
import Checkbox from '../../Checkbox';

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
  isShowAuthor: boolean;
}

export class SettingsModal extends React.Component<SettingsModalProps, {}> {
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
      </Modal>
    );
  }
}

export default SettingsModal;
