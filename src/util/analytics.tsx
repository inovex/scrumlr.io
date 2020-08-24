import * as React from 'react';
import * as GoogleAnalytics from 'react-ga';
import { hash } from './crypto';

GoogleAnalytics.initialize('UA-110551933-1');

const withTracker = (WrappedComponent: any, options = {}) => {
  const trackPage = async (page: string) => {
    const path = page.split('/');
    if (
      path.length === 3 &&
      (path[1] === 'board' || path[1] === 'print' || path[1] === 'join')
    ) {
      path[2] = await hash(path[2]);
    }
    const hashedPath = path.join('/');

    GoogleAnalytics.set({
      newPage: hashedPath,
      ...options
    });
    GoogleAnalytics.pageview(hashedPath);
  };

  // eslint-disable-next-line
  class HOC extends React.Component<{ location: any }> {
    componentDidMount() {
      // eslint-disable-next-line
      const page = this.props.location.pathname + this.props.location.search;
      trackPage(page);
    }

    componentDidUpdate(prevProps: any) {
      const currentPage =
        prevProps.location.pathname + prevProps.location.search;
      const nextPage =
        this.props.location.pathname + this.props.location.search;

      if (currentPage !== nextPage) {
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return HOC;
};

export default withTracker;
