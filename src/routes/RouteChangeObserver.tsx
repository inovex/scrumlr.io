import {useLocation} from "react-router";
import {useLayoutEffect} from "react";
import {useAppDispatch} from "store";
import {setRoute} from "store/features";

const RouteChangeObserver = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    // write new route into store
    dispatch(setRoute(location.pathname));

    // scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname, dispatch]);

  return null;
};

export default RouteChangeObserver;
