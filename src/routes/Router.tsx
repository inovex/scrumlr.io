import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import {LoginBoard} from "routes/LoginBoard";
import {Boards} from "routes/Boards";
import {Templates} from "routes/Boards/Templates";
import {Sessions} from "routes/Boards/Sessions";
import {BoardGuard} from "routes/Board";
import {NotFound} from "routes/NotFound";
import {RequireAuthentication} from "routes/RequireAuthentication";
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
import {ENABLE_ALL} from "constants/settings";
import {useAppSelector} from "store";
import {Homepage} from "./Homepage";
import {Legal} from "./Legal";
import {StackView} from "./StackView";
import RouteChangeObserver from "./RouteChangeObserver";
import {LegacyNewBoard} from "./Boards/Legacy/LegacyNewBoard";
import {TemplateEditor} from "./Boards/TemplateEditor/TemplateEditor";
import {VerifiedAccountGuard} from "./Guards/VerifiedAccountGuard";

const renderLegacyRoute = (legacy: boolean) => (legacy ? <Route path="/new" element={<LegacyNewBoard />} /> : <Route path="/new" element={<Navigate to="/boards" />} />);

const Router = () => {
  const legacyCreateBoard = !!useAppSelector((state) => state.view.legacyCreateBoard);
  const feedbackEnabled = useAppSelector((state) => state.view.feedbackEnabled);

  return (
    <BrowserRouter>
      <RouteChangeObserver />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/legal/termsAndConditions" element={<Legal document="termsAndConditions" />} />
        <Route path="/legal/privacyPolicy" element={<Legal document="privacyPolicy" />} />
        <Route path="/legal/cookiePolicy" element={<Legal document="cookiePolicy" />} />
        {renderLegacyRoute(legacyCreateBoard)}
        <Route
          path="/boards"
          element={
            <RequireAuthentication>
              <Boards />
            </RequireAuthentication>
          }
        >
          <Route index element={<Navigate to="templates" />} />
          <Route path="templates" element={<Templates />}>
            <Route path="settings" element={<SettingsDialog enabledMenuItems={{appearance: true, feedback: feedbackEnabled, profile: true}} />}>
              <Route path="appearance" element={<Appearance />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>
          </Route>

          <Route
            path="create"
            element={
              <VerifiedAccountGuard>
                <TemplateEditor mode="create" />
              </VerifiedAccountGuard>
            }
          />

          <Route
            path="edit/:id"
            element={
              <VerifiedAccountGuard>
                <TemplateEditor mode="edit" />
              </VerifiedAccountGuard>
            }
          />

          <Route path="sessions" element={<Sessions />}>
            <Route path="settings" element={<SettingsDialog enabledMenuItems={{feedback: feedbackEnabled, profile: true, share: true, export: true}} />}>
              <Route path="share" element={<ShareSession />} />
              <Route path="export" element={<ExportBoard />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>
          </Route>
        </Route>
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
          <Route path="settings" element={<SettingsDialog enabledMenuItems={{...ENABLE_ALL, feedback: feedbackEnabled}} />}>
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
};

export default Router;
