import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import JobCreate from "@/pages/JobCreate";
import JobDetail from "@/pages/JobDetail";
import CandidateBoard from "@/pages/CandidateBoard";
import CandidateDetail from "@/pages/CandidateDetail";
import ComingSoon from "@/pages/ComingSoon";

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size={28} className="text-indigo" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
      <Route path="/jobs/create" element={<PrivateRoute><JobCreate /></PrivateRoute>} />
      <Route path="/jobs/:id" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
      <Route path="/jobs/:id/board" element={<PrivateRoute><CandidateBoard /></PrivateRoute>} />
      <Route path="/candidates/:id" element={<PrivateRoute><CandidateDetail /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><ComingSoon title="Reports" /></PrivateRoute>} />

      <Route path="/admin/users" element={<AdminRoute><ComingSoon title="User Management" /></AdminRoute>} />
      <Route path="/admin/resumes" element={<AdminRoute><ComingSoon title="Uploaded Resumes" /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><ComingSoon title="System Analytics" /></AdminRoute>} />
      <Route path="/admin/ai-usage" element={<AdminRoute><ComingSoon title="AI Usage & Cost" /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="bottom-right" richColors closeButton />
      </BrowserRouter>
    </AuthProvider>
  );
}
