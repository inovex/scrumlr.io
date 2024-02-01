import {Outlet, useLocation} from "react-router-dom";
import {useLayoutEffect} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";

const RouteChangeObserver = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    // write new route into store
    dispatch(Actions.setRoute(location.pathname));

    // scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname, dispatch]);

  return <Outlet />;
};

export default RouteChangeObserver;
