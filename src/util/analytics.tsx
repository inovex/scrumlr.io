import * as React from 'react';
import * as GoogleAnalytics from 'react-ga';

GoogleAnalytics.initialize('UA-110551933-1');

const withTracker = (WrappedComponent: any, options = {}) => {
  const trackPage = (page: string) => {
    GoogleAnalytics.set({
      page,
      ...options
    });
    GoogleAnalytics.pageview(page);
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
