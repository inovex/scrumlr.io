import * as cx from 'classnames';
import * as React from 'react';
import './ColumnView.scss';
import * as ReactSwipe from 'react-swipe';

import { IndexedPhaseConfiguration } from '../../constants/Retrospective';
import Column from '../Column';
import { mapStateToProps } from './ColumnView.container';
import { connect } from 'react-redux';

export interface OwnColumnViewProps {
  boardUrl: string;
  children?: any;
  className?: string;
}

export interface StateColumnViewProps {
  phase: IndexedPhaseConfiguration;
  filteredCardType?: string;
}

export type ColumnViewProps = OwnColumnViewProps & StateColumnViewProps;

export interface ColumnViewState {
  activeColumn: number;
  showCarousel: boolean;
}

export class ColumnView extends React.Component<
  ColumnViewProps,
  ColumnViewState
> {
  constructor(props: ColumnViewProps) {
    super(props);

    this.state = {
      activeColumn: 0,
      showCarousel: false
    };
  }

  reactSwipe: any;

  updateSize = () => {
    if (window.innerWidth >= 1280 && this.state.showCarousel) {
      this.setState({ ...this.state, showCarousel: false });
    }

    if (window.innerWidth < 1280 && !this.state.showCarousel) {
      this.setState({ ...this.state, showCarousel: true });
    }
  };

  updateActiveColumn = (index: number) => {
    this.setState({
      ...this.state,
      activeColumn: index
    });
  };

  gotoPreviousColumn = () => {
    if (this.state.activeColumn > 0) {
      this.setState({
        ...this.state,
        activeColumn: this.state.activeColumn - 1
      });
      this.reactSwipe.prev();
    }
  };

  gotoNextColumn = () => {
    if (this.state.activeColumn < this.props.phase.columns.length - 1) {
      this.setState({
        ...this.state,
        activeColumn: this.state.activeColumn + 1
      });
      this.reactSwipe.next();
    }
  };

  componentDidMount() {
    this.updateSize();
    window.addEventListener('resize', this.updateSize, true);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  render() {
    const { columns } = this.props.phase;

    const renderedColumns = columns
      .filter(
        column =>
          this.state.showCarousel && this.props.filteredCardType
            ? column.id === this.props.filteredCardType
            : true
      )
      .map((column, index, values) => (
        <Column
          column={column}
          key={column.id}
          boardUrl={this.props.boardUrl}
          phase={this.props.phase}
          isActive={this.state.activeColumn === index}
          hasPreviousColumn={index > 0}
          hasNextColumn={index < values.length - 1}
          onGoToPrevColumn={this.gotoPreviousColumn}
          onGoToNextColumn={this.gotoNextColumn}
          className="board__column"
          isCompactView={this.state.showCarousel}
        />
      ));

    const activeIndicators = renderedColumns.map((column, index) => (
      <div
        key={`indicator-${index}`}
        className={cx('column-view__active-indicator', {
          ['column-view__active-indicator--active']:
            index === this.state.activeColumn
        })}
      />
    ));

    const componentClassName = cx('board', this.props.className);
    return this.state.showCarousel ? (
      <div className="column-view__wrapper">
        {!this.props.filteredCardType && (
          <div className="column-view__active-indicator-list">
            {activeIndicators}
          </div>
        )}
        <ReactSwipe
          key={`column-view-${renderedColumns.length}`}
          ref={(rs: any) => (this.reactSwipe = rs)}
          className={componentClassName}
          swipeOptions={{
            continuous: false,
            callback: this.updateActiveColumn
          }}
        >
          {renderedColumns}
        </ReactSwipe>
      </div>
    ) : (
      <main className={componentClassName}>{renderedColumns}</main>
    );
  }
}

export default connect<StateColumnViewProps, null, OwnColumnViewProps>(
  mapStateToProps
)(ColumnView);
