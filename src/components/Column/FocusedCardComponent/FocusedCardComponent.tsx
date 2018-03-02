import * as React from 'react';
import Component from '../Component/Component';
import FocusedCard from '../../FocusedCard';
import Action from '../../Action';
import CardNavigation from '../../CardNavigation/CardNavigation';
import { Card as CardModel } from '../../../types';
import { connectWithProps } from '../../../util/redux';
import { mapStateToProps } from './FocusedCardComponent.container';
import { getInversedTheme } from '../../../constants/Retrospective';

export interface OwnFocusedCardComponentProps {
  boardUrl: string;
  focused: CardModel;
  isSummary: boolean;
  className?: string;
  showVotes: boolean;
}

export interface ConnectedFocusedCardComponentProps {
  cards: CardModel[];
  setRootCard: (index: number) => void;
}

export interface FocusedCardComponentProps
  extends OwnFocusedCardComponentProps,
    ConnectedFocusedCardComponentProps {}

export interface FocusedCardComponentState {
  currentCardIndex: number;
}

class FocusedCardComponent extends React.Component<
  FocusedCardComponentProps,
  FocusedCardComponentState
> {
  constructor(props: FocusedCardComponentProps) {
    super(props);

    this.state = { currentCardIndex: 0 };
  }

  componentWillReceiveProps(nextProps: FocusedCardComponentProps) {
    if (nextProps.focused.id !== this.props.focused.id) {
      this.setState({ currentCardIndex: 0 });
    }
  }

  onPreviousCard = () => {
    if (this.state.currentCardIndex > 0) {
      this.setState({
        currentCardIndex: this.state.currentCardIndex - 1
      });
    }
  };

  onNextCard = () => {
    if (this.state.currentCardIndex < this.props.cards.length - 1) {
      this.setState({
        currentCardIndex: this.state.currentCardIndex + 1
      });
    }
  };

  render() {
    let theme: 'dark' | 'light' = 'dark';
    if (!this.props.isSummary) {
      theme = this.props.focused.type === 'positive' ? 'dark' : 'light';
    }

    return (
      <Component className={this.props.className}>
        <FocusedCard
          boardUrl={this.props.boardUrl}
          card={this.props.cards[this.state.currentCardIndex]}
          isRootCard={this.state.currentCardIndex === 0}
          setAsRoot={() => {
            this.props.setRootCard(this.state.currentCardIndex);
            this.setState({ currentCardIndex: 0 });
          }}
          showVotes={this.props.showVotes}
        />
        <Action theme={theme}>
          <CardNavigation
            theme={
              this.props.isSummary
                ? 'dark'
                : getInversedTheme(
                    this.props.cards[this.state.currentCardIndex].type
                  )
            }
            size={this.props.cards.length}
            currentIndex={this.state.currentCardIndex}
            onNext={this.onNextCard}
            onPrevious={this.onPreviousCard}
          />
        </Action>
      </Component>
    );
  }
}

export default connectWithProps<
  OwnFocusedCardComponentProps,
  FocusedCardComponentProps
>(mapStateToProps)(FocusedCardComponent);
