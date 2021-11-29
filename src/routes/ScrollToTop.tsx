import {useLocation} from "react-router";
import {useLayoutEffect} from "react";

const ScrollToTop = function () {
  const location = useLocation();

  useLayoutEffect(() => {
    // scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
