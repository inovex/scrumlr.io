import {BrowserRouter, Routes} from "react-router-dom";
import {LoginBoard} from "routes/LoginBoard";
import {NewBoard} from "routes/NewBoard";
import {BoardGuard} from "routes/Board";
import {NotFound} from "routes/NotFound";
import {RequireAuthentication} from "routes/RequireAuthentication";
import {Route} from "react-router";
import {SettingsDialog} from "components/SettingsDialog";
import {ExportBoard} from "components/SettingsDialog/ExportBoard";
import {ShareSession} from "components/SettingsDialog/ShareSession";
import {BoardSettings} from "components/SettingsDialog/BoardSettings/BoardSettings";
import {Appearance} from "components/SettingsDialog/Appearance/Appearance";
import {Participants} from "components/SettingsDialog/Participants/Participants";
import {Feedback} from "components/SettingsDialog/Feedback";
import {VotingDialog} from "components/VotingDialog";
import {TimerDialog} from "components/TimerDialog";
import {ProfileSettings} from "components/SettingsDialog/ProfileSettings";
import {Homepage} from "./Homepage";
import {Legal} from "./Legal";
import {StackView} from "./StackView";
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
        path="/board/:boardId/print"
        element={
          <RequireAuthentication>
            <BoardGuard printViewEnabled />
          </RequireAuthentication>
        }
      />
      <Route
        path="/board/:boardId"
        element={
          <RequireAuthentication>
            <BoardGuard printViewEnabled={false} />
          </RequireAuthentication>
        }
      >
        <Route path="settings" element={<SettingsDialog />}>
          <Route path="board" element={<BoardSettings />} />
          <Route path="participants" element={<Participants />} />
          <Route path="appearance" element={<Appearance />} />
          <Route path="share" element={<ShareSession />} />
          <Route path="export" element={<ExportBoard />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        <Route path="voting" element={<VotingDialog />} />
        <Route path="timer" element={<TimerDialog />} />
        <Route path="note/:noteId/stack" element={<StackView />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
