import * as cx from 'classnames';
import * as React from 'react';
import { Component } from 'react';
import './AddCard.css';
import { BoardProp } from '../../types';
import { mapStateToProps } from './AddCard.container';
import { Column, getTheme } from '../../constants/Retrospective';
import Icon from '../Icon/Icon';
import Input from '../Input/Input';
import { connect } from 'react-redux';
import { withFirebase } from 'react-redux-firebase';

export type AddCardTheme = 'light' | 'dark' | 'mint';

export interface OwnAddCardProps extends BoardProp {
  column: Column;
}

export interface OwnAddCardPropsWithFirebase extends OwnAddCardProps {
  firebase: {
    push: (ref: string, value: any) => Promise<any>;
  };
}

export interface StateAddCardProps {
  /** Callback function on add of card. */
  onAdd: (columnId: string, text: string, timestamp?: string) => void;
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

  handleAdd = () => {
    const { column, onAdd } = this.props;
    const { text } = this.state;

    if (text.length > 0) {
      onAdd(column.id, text);
      this.setState(() => ({ text: '' }));
    }
  };

  render() {
    const { column } = this.props;
    const { text } = this.state;

    const theme = getTheme(column.type);

    return (
      <div className={cx('add-card', `add-card--theme-${theme}`)}>
        <Input
          invertPlaceholder={theme === 'mint'}
          showUnderline={false}
          placeholder={`Add ${column.name} card`}
          value={text}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />

        <button
          type="button"
          className="add-card__button"
          onClick={this.handleAdd}
          disabled={text.length === 0}
        >
          <Icon name="plus" width={null} height={null} aria-hidden="true" />
        </button>
      </div>
    );
  }
}

export default connect<StateAddCardProps, null, OwnAddCardProps>(
  mapStateToProps
)(withFirebase(AddCard));
