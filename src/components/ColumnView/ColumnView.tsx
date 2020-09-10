import * as cx from 'classnames';
import * as React from 'react';
import './ColumnView.scss';
import * as ReactSwipe from 'react-swipe';

import { ColumnType, PhaseConfiguration } from '../../constants/Retrospective';
import Column from '../Column';
import { mapStateToProps } from './ColumnView.container';
import { connect } from 'react-redux';

export interface OwnColumnViewProps {
  isAdmin: boolean;
  isShowCards: boolean;
  boardUrl: string;
  children?: any;
  className?: string;
  phasesConfig: { [key: string]: PhaseConfiguration };
  onUpdateColumnName: (columnId: string, newName: string) => void;
}

export interface StateColumnViewProps {
  filteredCardType?: string;
  guidedPhase: number;
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
    if (
      this.state.activeColumn <
      Object.keys(this.props.phasesConfig[this.props.guidedPhase].columns)
        .length -
        1
    ) {
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
    const columns = this.props.phasesConfig[this.props.guidedPhase].columns;

    const phase = {guidedPhase: this.props.guidedPhase, config: this.props.phasesConfig[this.props.guidedPhase]};
    const renderedColumns = Object.keys(columns)
      .filter(key =>
        this.state.showCarousel && this.props.filteredCardType
          ? key === this.props.filteredCardType
          : true
      )
      // Actions should always be on the right-hand side of the board
      .sort((a, b) => {
        if (columns[a].type === ('actions' as ColumnType)) return 1;
        if (columns[b].type === ('actions' as ColumnType)) return -1;
        return 0;
      })
      .map((key, index, values) => (
        <Column
          isAdmin={this.props.isAdmin}
          isShowCards={this.props.isShowCards}
          key={key}
          id={key}
          boardUrl={this.props.boardUrl}
          phase={phase}
          isActive={this.state.activeColumn === index}
          hasPreviousColumn={index > 0}
          hasNextColumn={index < values.length - 1}
          onGoToPrevColumn={this.gotoPreviousColumn}
          onGoToNextColumn={this.gotoNextColumn}
          onUpdateColumnName={this.props.onUpdateColumnName}
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
