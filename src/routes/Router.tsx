import {BrowserRouter, Routes} from "react-router-dom";
import {LoginBoard} from "routes/LoginBoard";
import {NewBoard} from "routes/NewBoard";
import {BoardGuard} from "routes/Board";
import RequireAuthentication from "routes/RequireAuthentication";
import {AuthRedirect} from "routes/AuthRedirect";
import {Route} from "react-router";
import {Homepage} from "./Homepage";

const Router = function() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/new" element={<NewBoard />} />
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
}

export default Router;
