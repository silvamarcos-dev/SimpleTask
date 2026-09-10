import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Calendar from "./pages/Calendar";

import CreateMaintenance from "./pages/CreateMaintenance";

import CreateTask from "./pages/CreateTask";

import Dashboard from "./pages/Dashboard";

import EditMaintenance from "./pages/EditMaintenance";

import EditTask from "./pages/EditTask";

import Login from "./pages/Login";

import MaintenancePage from "./pages/Maintenance";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/maintenance"
        element={
          <ProtectedRoute>
            <MaintenancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/maintenance/new"
        element={
          <ProtectedRoute>
            <CreateMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/maintenance/:maintenanceId/edit"
        element={
          <ProtectedRoute>
            <EditMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/new"
        element={
          <ProtectedRoute>
            <CreateTask />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/:taskId/edit"
        element={
          <ProtectedRoute>
            <EditTask />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;