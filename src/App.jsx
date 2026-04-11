import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";

// --- PAGE IMPORTS ---
import Login from "./pages/Login";
import SubmitTicket from "./pages/SubmitTicket";
import AdminTickets from "./pages/AdminTickets";
import BookRoom from "./pages/BookRoom";
import AdminTasks from "./pages/AdminTasks";
import AllTickets from "./pages/AllTickets";
import AllTasks from "./pages/AllTasks";

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased">
      <Helmet>
        <title>NetDock | Gerald Solo</title>
      </Helmet>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/" element={<PageTransition><SubmitTicket /></PageTransition>} />
          <Route path="/book-room" element={<PageTransition><BookRoom /></PageTransition>} />

          {/* --- ADMIN ROUTES (IT PERSONNEL ONLY) --- */}
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute>
                <PageTransition><AdminTickets /></PageTransition>
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
                <PageTransition><AdminTasks /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/all-tickets"
            element={
              <ProtectedRoute>
                <PageTransition><AllTickets /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/all-tasks"
            element={
              <ProtectedRoute>
                <PageTransition><AllTasks /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* --- FALLBACK REDIRECT --- */}
          {/* Important: Keep only one '*' route at the very bottom */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
