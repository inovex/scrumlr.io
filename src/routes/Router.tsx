import {BrowserRouter, Routes} from "react-router-dom";
import {LoginBoard} from "routes/LoginBoard";
import {NewBoard} from "routes/NewBoard";
import {BoardGuard} from "routes/Board";
import PrivateRoute from "routes/PrivateRoute";
import {AuthRedirect} from "routes/AuthRedirect";
import {Route} from "react-router";

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<NewBoard />} />
      <Route path="/login" element={<LoginBoard />} />
      <Route path="/auth/redirect" element={<AuthRedirect />} />
      <Route
        path="/board/:boardId"
        element={
          <PrivateRoute>
            <BoardGuard />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default Router;
