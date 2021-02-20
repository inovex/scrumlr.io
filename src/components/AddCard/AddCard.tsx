import * as cx from 'classnames';
import * as React from 'react';
import { Component } from 'react';
import './AddCard.scss';
import { BoardProp } from '../../types';
import { mapStateToProps } from './AddCard.container';
import { Column, ColumnType, getTheme } from '../../constants/Retrospective';
import Input from '../Input/Input';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { CRYPTO } from '../../util/global';
import PlusCircle from '../Icon/PlusCircle';
export type AddCardTheme = 'light' | 'dark' | 'mint';

export interface OwnAddCardProps extends BoardProp {
  columnId: string;
  column: Column;
  disabled?: boolean;
}

export interface OwnAddCardPropsWithFirebase extends OwnAddCardProps {
  firebase: {
    push: (ref: string, value: any) => Promise<any>;
  };
}

export interface StateAddCardProps {
  /** Callback function on add of card. */
  onAdd: (
    type: string,
    theme: ColumnType,
    text: string,
    iv: string,
    timestamp?: string
  ) => void;
}

export type AddCardProps = OwnAddCardProps & StateAddCardProps;

export interface AddCardState {
  /** The current card text. */
  text: string;
}

const initialState: AddCardState = {
  text: ''
};

export class AddCard extends Component<AddCardProps, AddCardState> {
  state: AddCardState = initialState;

  handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ text: (event.target as HTMLInputElement).value });
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      // Enter-Key
      this.handleAdd();
    }
  };

  handleAdd = async () => {
    const { columnId, column, onAdd } = this.props;
    const { text } = this.state;

    if (text.length > 0) {
      const iv = await CRYPTO.generateInitializationVector();
      const encryptedText = await CRYPTO.encrypt(text, iv);
      onAdd(columnId, column.type, encryptedText, iv);
      this.setState(() => ({ text: '' }));
    }
  };

  render() {
    const { column, disabled } = this.props;
    const { text } = this.state;

    const theme = getTheme(column.type);

    return (
      <div className={cx('add-card', `add-card--theme-${theme}`)}>
        <Input
          invertPlaceholder={theme === 'mint'}
          showUnderline={false}
          placeholder={`Add ${column.name} note`}
          autocomplete="off"
          type="text"
          value={text}
          onChange={(e: any) => this.handleChange(e)}
          onKeyDown={(e: any) => this.handleKeyDown(e)}
          disabled={disabled}
        />

        <button
          type="button"
          className="add-card__button"
          onClick={() => this.handleAdd()}
          aria-label={`Submit ${column.name} card`}
          disabled={disabled || text.length === 0}
        >
          <PlusCircle
            svgClassName="add-card__plus-circle"
            circleClassName="add-card__plus-circle-icon-circle"
            plusLineClassName="add-card__plus-circle-icon-plus-line"
          />
        </button>
      </div>
    );
  }
}
export default compose(
  firebaseConnect(),
  connect(mapStateToProps)
)(AddCard as any) as React.ComponentClass<any>;
