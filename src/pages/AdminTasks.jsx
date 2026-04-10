import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";

export default function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // To populate assignment dropdown
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Form State for New Task
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    assigned_user_ids: [], // Changed to an array
    start_date: new Date().toISOString().slice(0, 16),
    end_date: "",
    status: "pending",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const taskRes = await api.get("/tasks");
      setTasks(taskRes.data);

      const userRes = await api.get("/users"); // Assuming you have a route to get personnel
      setUsers(userRes.data);
      if (userRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          assigned_user_id: userRes.data[0].id,
        }));
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Quick validation: Ensure a person is selected
    if (!formData.assigned_user_id) {
      alert("Protocol Error: You must select an assigned personnel.");
      return;
    }

    try {
      // 2. Prepare the payload to match your Database Schema
      const payload = {
        task_name: formData.task_name,
        description: formData.description,
        assigned_user_id: formData.assigned_user_id,
        // Clean dates: MySQL/Postgres prefers ' ' instead of 'T' from HTML inputs
        start_date: formData.start_date.replace("T", " "),
        end_date: formData.end_date.replace("T", " "),
        status: formData.status || "pending",
        remarks: formData.remarks || null,
      };

      console.log("Initializing Dispatch...", payload);

      const response = await api.post("/tasks", payload);

      // 3. Reset form on success
      setFormData({
        ...formData,
        task_name: "",
        description: "",
        assigned_user_id: "",
        remarks: "",
        // Reset dates to current if desired
      });

      fetchInitialData();
      alert("Task Successfully Initialized in NetDock.");
    } catch (err) {
      // 4. Dynamic Error Handling: Tell the user EXACTLY what is wrong
      if (err.response && err.response.data.errors) {
        const serverErrors = err.response.data.errors;
        // Get the first error message from the Laravel Validator
        const firstErrorMessage = Object.values(serverErrors)[0][0];
        alert(`Validation Failed: ${firstErrorMessage}`);
      } else if (err.response && err.response.status === 500) {
        alert(
          "Database Error: Check your Laravel logs (admin_id might be missing).",
        );
      } else {
        alert("Network Error: Could not connect to NetDock API.");
      }

      console.error("Full Debug Info:", err.response?.data);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      await api.put(`/tasks/${id}`, updates);
      fetchInitialData();
    } catch (err) {
      console.error("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const statusColors = {
    pending: "border-gray-300 bg-gray-100 text-gray-500",
    in_progress: "border-[#123765] bg-[#123765] text-white",
    completed: "border-green-600 bg-green-600 text-white",
    delayed: "border-red-600 bg-red-500 text-white",
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-screen w-full bg-[#fcfcfd] overflow-x-hidden lg:overflow-hidden font-sans antialiased">
      {/* --- NAVBAR --- */}
      <nav className="h-16 flex-none bg-[#1A2634] text-white flex items-center justify-between px-4 md:px-8 border-b border-[#CCAA49]/20 z-50 shadow-md">
        <div className="flex items-center gap-10">
          <Link
            to="/admin/tickets"
            className="text-[#CCAA49] text-2xl font-black tracking-tighter italic"
          >
            NetDock
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link
              to="/admin/tickets"
              className="hover:text-[#CCAA49] transition"
            >
              Active Tickets
            </Link>
            <Link
              to="/admin/tasks"
              className="text-[#CCAA49] border-b-2 border-[#CCAA49] pb-1"
            >
              Task Manager
            </Link>
            <Link
              to="/admin/all-tickets"
              className="hover:text-[#CCAA49] transition"
            >
              All Tickets
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-[10px] font-black uppercase bg-red-900/40 px-4 py-2 hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        {/* --- SIDEBAR: TASK CREATOR --- */}
        <aside className="w-full lg:w-[400px] lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shadow-lg z-30 lg:overflow-hidden flex-none">
          {/* Header Section */}
          <div className="p-6 md:p-10 pb-4 md:pb-6">
            <div className="w-12 h-1 bg-[#CCAA49] mb-6"></div>
            <h1 className="text-3xl font-black text-[#1A2634] tracking-tighter italic leading-none">
              Task <br /> Assignment
            </h1>
            <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-[0.4em] flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#CCAA49]"></span>
              Operation Logistics // Schema v1.1
            </p>
          </div>

          {/* Form Section */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="flex-1 px-6 md:px-10 pb-8 md:pb-10 space-y-6 lg:overflow-y-auto custom-scrollbar pt-4"
          >
            {/* Task Name (task_name) */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49] transition-colors">
                Task Name
              </label>
              <input
                required
                className="modern-terminal-input"
                value={formData.task_name}
                onChange={(e) =>
                  setFormData({ ...formData, task_name: e.target.value })
                }
                placeholder="e.g. Server Migration"
              />
            </div>

            {/* Assigned Personnel (assigned_user_id) */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-[#CCAA49] uppercase tracking-[0.2em] ml-1">
                Assign To Personnel
              </label>
              <div className="relative">
                <select
                  required
                  className="modern-terminal-input appearance-none cursor-pointer"
                  value={formData.assigned_user_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assigned_user_id: e.target.value,
                    })
                  }
                >
                  <option value="">SELECT USER...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#CCAA49]">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dates Grid (start_date & end_date) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 group">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  required
                  className="modern-terminal-input !p-3 text-[10px]"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2 group">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  required
                  className="modern-terminal-input !p-3 text-[10px]"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Description (description) */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Description
              </label>
              <textarea
                rows="3"
                className="modern-terminal-input resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter technical details..."
              />
            </div>

            {/* Status (status) & Remarks (remarks) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 group">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Initial Status
                </label>
                <select
                  className="modern-terminal-input !p-3"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 group">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49]">
                  Remarks
                </label>
                <input
                  className="modern-terminal-input !p-3"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#1A2634] hover:bg-[#123765] text-[#CCAA49] font-black py-5 uppercase tracking-[0.3em] text-[10px] shadow-2xl active:translate-y-1 border border-[#CCAA49]/20"
              >
                Initialize Task
              </button>
            </div>
          </motion.form>

          <style
            dangerouslySetInnerHTML={{
              __html: `
    .modern-terminal-input {
      width: 100%;
      padding: 1rem;
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-left: 4px solid #d1d5db;
      font-size: 0.6875rem;
      font-weight: 900;
      color: #1A2634;
      outline: none;
      transition: all 0.2s ease;
    }
    .modern-terminal-input::placeholder {
      color: #e5e7eb;
    }
    .modern-terminal-input:focus {
      background-color: #ffffff;
      border-color: #CCAA49;
      border-left-color: #CCAA49;
      box-shadow: 0 0 0 4px rgba(204, 170, 73, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCAA49; }
  `,
            }}
          />
        </aside>

        {/* --- MAIN FEED: TASK STREAM --- */}
        <main className="flex-1 lg:h-full flex flex-col bg-[#f8fafc]">
          <header className="px-6 py-6 md:px-10 md:py-8 bg-white border-b border-gray-100 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-[#1A2634] tracking-tighter italic uppercase leading-none">
                IT Updates
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">
                Active Personnel Tasks
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Active Load
              </p>
              <p className="text-4xl font-black text-[#123765] leading-none">
                {tasks.length}
              </p>
            </div>
          </header>

          <div className="flex-1 lg:overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {tasks.map((task, index) => (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  key={task.id}
                  className="bg-white border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all relative flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span
                      className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${statusColors[task.status]}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-300">
                      TSK-{task.id.toString().padStart(4, "0")}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#1A2634] uppercase tracking-tight mb-2">
                    {task.task_name}
                  </h3>
                  <p className="text-[11px] font-bold text-[#CCAA49] mb-4 uppercase tracking-widest">
                    Assignee:{" "}
                    {task.assigned_user?.name || "ID: " + task.assigned_user_id}
                  </p>

                  <div className="flex-1 bg-gray-50 p-4 text-xs text-gray-600 italic border border-gray-100 mb-6">
                    "{task.description || "No description provided."}"
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                      <span className="text-gray-400">Timeframe</span>
                      <span className="text-[#1A2634]">
                        {new Date(task.start_date).toLocaleDateString()} -{" "}
                        {new Date(task.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        Update Remarks
                      </label>
                      <input
                        className="w-full p-2 bg-gray-50 border border-gray-100 text-[10px] outline-none focus:bg-white"
                        placeholder="Add progress note..."
                        onBlur={(e) =>
                          handleUpdateTask(task.id, { remarks: e.target.value })
                        }
                        defaultValue={task.remarks}
                      />
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTask(task.id, { status: e.target.value })
                      }
                      className="w-full p-3 bg-[#1A2634] text-white text-[10px] font-black uppercase outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCAA49; }
      `,
        }}
      />
    </div>
  );
}
