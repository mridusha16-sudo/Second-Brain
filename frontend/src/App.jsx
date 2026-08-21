import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import AuthenForm from "./AuthenForm";
import ResetPassword from "./ResetPassword";

import ProtectedRoute from "./ProtectedRoute";

import Dash from "./Dash";
import SubWork from "./SubWork";
import Notes from "./Notes";
import FileUpload from "./FileUpload";
import PDFViewer from "./PDFViewer";
import Settings from "./Settings";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==========================================
            AUTHENTICATION
        ========================================== */}

        <Route
          path="/"
          element={<AuthenForm />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* ==========================================
            PROTECTED ROUTES
        ========================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dash />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <SubWork />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <FileUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pdf-viewer"
          element={
            <ProtectedRoute>
              <PDFViewer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;