import { Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// --- PAGE IMPORTS ---
import Login from "./pages/Login";
import SubmitTicket from "./pages/SubmitTicket";
import AdminTickets from "./pages/AdminTickets";
import BookRoom from "./pages/BookRoom";
import AdminTasks from "./pages/AdminTasks";
import AllTickets from "./pages/AllTickets";

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <Helmet>
        <title>NetDock | Gerald Solo</title>
      </Helmet>

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<SubmitTicket />} />
        <Route path="/book-room" element={<BookRoom />} />

        {/* --- ADMIN ROUTES (IT PERSONNEL ONLY) --- */}
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute>
              <AdminTickets />
            </ProtectedRoute>
          }
        />

        {/* If you are using the AdminTickets code I gave you previously, 
          tasks are ALREADY integrated there. If you want a separate page, 
          make sure you create AdminTasks.jsx and uncomment the import above.
        */}
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute>
              <AdminTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/all-tickets"
          element={
            <ProtectedRoute>
              <AllTickets />
            </ProtectedRoute>
          }
        />

        {/* --- FALLBACK REDIRECT --- */}
        {/* Important: Keep only one '*' route at the very bottom */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
