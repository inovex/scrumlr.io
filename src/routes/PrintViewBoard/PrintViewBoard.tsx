import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, dataToJS } from 'react-redux-firebase';
import { RouteComponentProps } from 'react-router';
import { groupBy, sortBy } from 'lodash';
import { isEmpty } from 'lodash';

import HeadlinePrefix from './subcomponents/HeadlinePrefix';
import { StoreState, BoardCards, BoardConfig, Card } from '../../types';
import './PrintViewBoard.css';

export interface PrintViewBoardProps
  extends RouteComponentProps<{ id: string }> {
  cards: BoardCards;
  boardConfig: BoardConfig;
  boardUrl: string;
}

interface PrintColumnCards {
  positive: Card[];
  negative: Card[];
  actions: Card[];
}

function callBrowserPrintDialog() {
  // Wait some time so that everything has had time to render correctly.
  setTimeout(() => {
    window.print();
  }, 100);
}

export class PrintViewBoard extends React.Component<PrintViewBoardProps, {}> {
  static sortCards(cards: BoardCards): PrintColumnCards {
    const cardsArray = Object.keys(cards).map(key => cards[key]);
    const groups = (groupBy(cardsArray, 'type') as any) as PrintColumnCards;
    for (let key in groups) {
      const sorted = sortBy(groups[key], ['votes', 'timestamp']);
      sorted.reverse();
      groups[key] = sorted;
    }
    return groups;
  }

  handleClickBackButton = () => {
    window.location.hash = this.props.boardUrl;
  };

  componentDidMount() {
    // If data has already been loaded previously by other component (e.g. the board),
    // the browser print dialog can be called directly.
    if (!isEmpty(this.props.cards)) {
      callBrowserPrintDialog();
    }
  }

  componentWillReceiveProps(newProps: PrintViewBoardProps) {
    // If data has not been available already during mounting (e.g. when reloading the page),
    // call the browser dialog when data has arrived.
    if (
      isEmpty(this.props.cards) &&
      !isEmpty(newProps.cards) &&
      window &&
      typeof window.print === 'function'
    ) {
      callBrowserPrintDialog();
    }
  }

  renderCardSection(title: string, type: string, cards: Card[] = []) {
    const colorMap = {
      positive: 'lightgray',
      negative: 'black',
      actions: '#00E7C2'
    };
    const headlinePrefixColor = colorMap[type] || 'lightgray';
    return (
      <div className="card-section">
        <h2 className="card-section-headline">
          <HeadlinePrefix
            className="headline-prefix"
            color={headlinePrefixColor}
            width="2.5em"
            height="1.75em"
          />
          {title}
          <span
            className="headline-badge headline-badge--after"
            data-badge={cards.length + ' cards'}
          />
        </h2>
        <ol className="card-list">
          {cards.map(card => this.renderCardItem(card, 'li'))}
        </ol>
      </div>
    );
  }

  renderCardItem(card: Card, TagName: string) {
    return (
      <TagName className="card-list__item" key={card.id}>
        <h3>
          {card.text}
        </h3>
        <ul className="card-list-meta">
          <li
            className="card-list-meta__item meta-votes"
            data-badge={card.votes + ' votes'}
          />
        </ul>
      </TagName>
    );
  }

  render() {
    const { cards, boardConfig } = this.props;
    const cardsSorted = PrintViewBoard.sortCards(cards);
    if (Object.keys(cardsSorted).length === 0) {
      return <p>loading ...</p>;
    }

    const adText = (
      <span className="ad-text ad-text--headline">powered by scrumlr.io</span>
    );
    let title = (
      <h1>
        Retrospective results {adText}
      </h1>
    );

    if (boardConfig.name) {
      title = (
        <h1>
          {boardConfig.name} {adText}
        </h1>
      );
    }

    return (
      <div className="print-view-board">
        <div className="buttonbar">
          <button className="back-button" onClick={this.handleClickBackButton}>
            Go back to the board
          </button>
        </div>

        {title}

        {this.renderCardSection('Positive', 'positive', cardsSorted.positive)}
        {this.renderCardSection('Negative', 'negative', cardsSorted.negative)}
        {this.renderCardSection('Actions', 'actions', cardsSorted.actions)}
      </div>
    );
  }
}

export function mapStateToProps(
  state: StoreState,
  ownProps: PrintViewBoardProps
) {
  const { fbState } = state;
  const boardSelector = `/boards/${ownProps.match.params.id}`;
  const boardUrl = `/board/${ownProps.match.params.id}`;
  const cards: BoardCards = dataToJS(fbState, `${boardSelector}/cards`, {});
  const boardConfig: BoardConfig = dataToJS(
    fbState,
    `${boardSelector}/config`,
    {}
  );

  return {
    cards,
    boardConfig,
    boardUrl
  };
}

function firebaseConnector(props: RouteComponentProps<{ id: string }>) {
  return [`/boards/${props.match.params.id}`];
}

export default compose(
  firebaseConnect(firebaseConnector),
  connect(mapStateToProps)
)(PrintViewBoard) as React.ComponentClass<any>;
