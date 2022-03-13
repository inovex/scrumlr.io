import {BrowserRouter, Routes} from "react-router-dom";
import {LoginBoard} from "routes/LoginBoard";
import {NewBoard} from "routes/NewBoard";
import {BoardGuard} from "routes/Board";
import {NotFound} from "routes/NotFound";
import {RequireAuthentication} from "routes/RequireAuthentication";
import {Route} from "react-router";
import {VotingDialog} from "components/VotingDialog";
import {TimerDialog} from "components/TimerDialog";
import {Homepage} from "./Homepage";
import {Legal} from "./Legal";
import RouteChangeObserver from "./RouteChangeObserver";

const Router = () => (
  <BrowserRouter>
    <RouteChangeObserver />
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/legal/termsAndConditions" element={<Legal document="termsAndConditions" />} />
      <Route path="/legal/privacyPolicy" element={<Legal document="privacyPolicy" />} />
      <Route path="/legal/cookiePolicy" element={<Legal document="cookiePolicy" />} />
      <Route
        path="/new"
        element={
          <RequireAuthentication>
            <NewBoard />
          </RequireAuthentication>
        }
      />
      <Route path="/login" element={<LoginBoard />} />
      <Route
        path="/board/:boardId"
        element={
          <RequireAuthentication>
            <BoardGuard />
          </RequireAuthentication>
        }
      >
        <Route path="voting" element={<VotingDialog />} />
        <Route path="timer" element={<TimerDialog />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
