import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import MaintenancePage from "./pages/Maintenance";
import CreateMaintenance from "./pages/CreateMaintenance";
import EditMaintenance from "./pages/EditMaintenance";

import Tasks from "./pages/Task";
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";

import Calendar from "./pages/Calendar";
import GoogleCallback from "./pages/GoogleCallback";

import Apartments from "./pages/Apartment";
import CreateApartment from "./pages/CreateApartment";
import EditApartment from "./pages/EditApartment";


function App() {
  return (
    <Routes>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =====================================================
          CADASTRO
      ===================================================== */}

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          MANUTENÇÕES
      ===================================================== */}

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

      {/* =====================================================
          TAREFAS
      ===================================================== */}

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
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

      {/* =====================================================
          CALENDÁRIO
      ===================================================== */}

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          APARTAMENTOS
      ===================================================== */}

      <Route
        path="/apartments"
        element={
          <ProtectedRoute>
            <Apartments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/apartments/new"
        element={
          <ProtectedRoute>
            <CreateApartment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/apartments/:id/edit"
        element={
          <ProtectedRoute>
            <EditApartment />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
  path="/auth/google/callback"
  element={<GoogleCallback />}
/>

    </Routes>
  );
}

export default App;