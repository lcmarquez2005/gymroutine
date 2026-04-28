import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { RoutinesManager } from './pages/RoutinesManager';
import { RoutineEditor } from './pages/RoutineEditor';
import { WorkoutSummary } from './pages/WorkoutSummary';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/routines" element={<RoutinesManager />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Rutas fuera del MainLayout (sin BottomNav) */}
            <Route path="/workout/:routineId" element={<ActiveWorkout />} />
            <Route path="/workout-summary" element={<WorkoutSummary />} />
            <Route path="/routines/new" element={<RoutineEditor />} />
            <Route path="/routines/:id/edit" element={<RoutineEditor />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;
