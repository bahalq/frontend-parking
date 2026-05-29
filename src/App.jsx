import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Components/Home";
import Login from "./Components/Login";
import "./styles.css";
import LanguageSwitcher from "./Components/LanguageSwitcher";
import NotFound from "./Components/NotFound";
import { useTranslation } from "react-i18next";
import AddGround from "./Components/AddGround";
import ViewAllGrounds from "./Components/viewAllGrounds";
import ProtectedRoute from "./Components/ProtectedRoute";
import GroundDetails from "./Components/GroundDetails";
import GroundsList from "./Components/GroundsList";
import ManageTerrains from "./Components/Admin/ManageTerrains";
import ViewBookings from "./Components/Admin/ViewBookings";
import ViewClients from "./Components/Admin/ViewClients";
import VerifyTicket from "./Components/Admin/VerifyTicket";
import VerifyBookingPage from "./Components/VerifyBookingPage";
import StaffVerify from "./Components/Staff/StaffVerify";
import StaffLogin from "./Components/Staff/StaffLogin";
import StaffDashboard from "./Components/Staff/StaffDashboard";
import StaffBookingDetail from "./Components/Staff/StaffBookingDetail";
import ManageStaff from "./Components/Admin/ManageStaff";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import DriverDashboard from "./Components/DriverDashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isLogin, role, loading, setIslogin, setRole } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (i18n.language === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="bg-transparent h-screen flex items-center justify-center">
        <div className="animate-spin border-2 rounded-full h-10 w-10 border-t-0 border-white"></div>
      </div>
    );
  }

  // Hide the main Header on admin and staff dashboard routes because they have their own layouts
  const isDashboardRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/staff");

  return (
    <>
      {!isDashboardRoute && (
        <Header
          role={role}
          isLogin={isLogin}
          setIslogin={setIslogin}
          setRole={setRole}
        />
      )}
        <Routes>
          {/* Admin Login (public, no protection) */}
          <Route
            path="/admin/login"
            element={
              isLogin ? (
                role === "Admin" ? (
                  <Navigate to="/admin/grounds" replace />
                ) : role === "Staff" ? (
                  <Navigate to="/staff/dashboard" replace />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              ) : (
                <Login setIslogin={setIslogin} setRole={setRole} />
              )
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/grounds/add"
            element={
              <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
                <AddGround />
              </ProtectedRoute>
            }
          />

        <Route
          path="/admin/grounds/:id/terrains"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <ManageTerrains />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/grounds"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <ViewAllGrounds />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <ViewBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <ViewClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verify-ticket"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <VerifyTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-staff"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <ManageStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff routes */}
        <Route
          path="/staff/login"
          element={
            isLogin ? (
              role === "Staff" ? (
                <Navigate to="/staff/dashboard" replace />
              ) : role === "Admin" ? (
                <Navigate to="/admin/grounds" replace />
              ) : (
                <Navigate to="/staff/login" replace />
              )
            ) : (
              <StaffLogin setIslogin={setIslogin} setRole={setRole} />
            )
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/booking/:id"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Staff">
              <StaffBookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/verify"
          element={
            <ProtectedRoute isLogin={isLogin} role={role} requiredRole="Staff">
              <StaffVerify />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/grounds" element={<GroundsList />} />
        <Route path="/grounds/:id" element={<GroundDetails />} />
        <Route path="/verify" element={<VerifyBookingPage />} />
        <Route path="/dashboard" element={<DriverDashboard />} />
        <Route path="/" element={<Home isLogin={isLogin} role={role} />} />

        <Route
          path="/login"
          element={
            isLogin ? (
              role === "Staff" ? (
                <Navigate to="/staff/dashboard" replace />
              ) : (
                <Navigate to="/admin/grounds" replace />
              )
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
}

export default App;
