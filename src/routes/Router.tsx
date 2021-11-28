import {BrowserRouter, Routes} from "react-router-dom";
import {LoginBoard} from "routes/LoginBoard";
import {NewBoard} from "routes/NewBoard";
import {BoardGuard} from "routes/Board";
import RequireAuthentication from "routes/RequireAuthentication";
import {AuthRedirect} from "routes/AuthRedirect";
import {Route} from "react-router";
import {Homepage} from "./Homepage";
import {Legal} from "./Legal";
import ScrollToTop from "./ScrollToTop";

const Router = function () {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />}>
          <Route path="/legal/termsAndConditions" element={<Legal document="termsAndConditions" />} />
          <Route path="/legal/privacyPolicy" element={<Legal document="privacyPolicy" />} />
          <Route path="/legal/cookiePolicy" element={<Legal document="cookiePolicy" />} />
        </Route>
        <Route
          path="/new"
          element={
            <RequireAuthentication>
              <NewBoard />
            </RequireAuthentication>
          }
        />
        <Route path="/login" element={<LoginBoard />} />
        <Route path="/auth/redirect" element={<AuthRedirect />} />
        <Route
          path="/board/:boardId"
          element={
            <RequireAuthentication>
              <BoardGuard />
            </RequireAuthentication>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
