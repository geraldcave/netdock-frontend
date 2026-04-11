import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };
  
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Form State for New Task
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    assigned_user_id: "",
    start_date: new Date().toISOString().slice(0, 16),
    end_date: "",
    status: "pending",
    remarks: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const taskRes = await api.get("/tasks");
      setTasks(taskRes.data);

      const userRes = await api.get("/users");
      setUsers(userRes.data);
      if (userRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          assigned_user_id: userRes.data[0].id,
        }));
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assigned_user_id) {
      showToast("Protocol Error: You must select an assigned personnel.", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        start_date: formData.start_date.replace("T", " "),
        end_date: formData.end_date.replace("T", " "),
      };

      await api.post("/tasks", payload);

      setFormData({
        task_name: "",
        description: "",
        assigned_user_id: users[0]?.id || "",
        start_date: new Date().toISOString().slice(0, 16),
        end_date: "",
        status: "pending",
        remarks: "",
      });

      fetchInitialData();
      setIsModalOpen(false);
      showToast("Task Successfully Initialized in NetDock.", "success");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        const firstErrorMessage = Object.values(err.response.data.errors)[0][0];
        showToast(`Validation Failed: ${firstErrorMessage}`, "error");
      } else {
        showToast("Network Error: Could not execute dispatch.", "error");
      }
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

  // Stats
  const activeTasks = tasks.filter(t => t.status !== "completed");
  const stats = {
    total: activeTasks.length,
    delayed: activeTasks.filter(t => t.status === "delayed").length,
  };

  const statusColors = {
    pending: { bg: "bg-gray-400", text: "text-white" },
    in_progress: { bg: "bg-[#123765]", text: "text-white" },
    completed: { bg: "bg-green-600", text: "text-white" },
    delayed: { bg: "bg-red-600", text: "text-white" },
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f8fafc] overflow-hidden font-sans antialiased text-[#1A2634]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-widest border ${toast.type === "success" ? "bg-[#1A2634] text-[#CCAA49] border-[#CCAA49]/20" : "bg-red-500 text-white border-red-400"}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- DESKTOP SIDEBAR (ADMIN DARK THEME) --- */}
      <aside className="hidden lg:flex w-72 h-full bg-[#1A2634] text-white flex-col shadow-2xl z-30 flex-none shrink-0 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCAA49] opacity-5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#123765] opacity-20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="p-6 h-full flex flex-col relative z-10 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="text-white text-2xl font-black tracking-tighter italic">
              Net<span className="text-[#CCAA49]">Dock</span>
            </Link>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">Logistic</span>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full bg-[#CCAA49] hover:bg-white text-[#1A2634] font-black py-4 px-4 rounded-lg shadow-[0_0_20px_rgba(204,170,73,0.3)] transition-all flex items-center justify-center gap-2 mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span className="uppercase tracking-widest text-[10px]">Initialize Dispatch</span>
          </button>

          <div className="space-y-8 flex-1">
            {/* System Overview Dashboard */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Load Monitoring</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#123765]/50 border border-[#123765] p-3 rounded-xl flex flex-col justify-center items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#CCAA49]">Active Load</span>
                  <span className="text-2xl font-black text-white leading-none mt-1">{stats.total}</span>
                </div>
                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl flex flex-col justify-center items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Delayed</span>
                  <span className="text-2xl font-black text-white leading-none mt-1">{stats.delayed}</span>
                </div>
              </div>
            </div>

            {/* Global Navigation */}
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Command Interfaces</h4>
               <div className="space-y-1">
                 <Link to="/admin/tickets" className="flex justify-between items-center text-sm font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#123765]/50 transition-colors text-left border border-transparent">
                    <span>Active Tickets</span>
                 </Link>
                 <Link to="/admin/all-tickets" className="flex justify-between items-center text-sm font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#123765]/50 transition-colors text-left border border-transparent">
                    <span>All Tickets (Archive)</span>
                 </Link>
                 <Link to="/admin/tasks" className="flex justify-between items-center text-sm font-bold text-[#1A2634] px-3 py-2.5 rounded-lg bg-[#CCAA49] text-left transition-all shadow-[0_0_15px_rgba(204,170,73,0.3)]">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Task Manager</span>
                 </Link>
                 <Link to="/admin/all-tasks" className="flex justify-between items-center text-sm font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#123765]/50 transition-colors text-left border border-transparent">
                    <span>All Tasks</span>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full flex flex-col bg-[#f8fafc] overflow-hidden shrink-0">
        
        {/* Header */}
        <header className="px-6 lg:px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-black text-[#1A2634] uppercase italic tracking-tight">IT Updates</h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm font-bold">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="lg:hidden bg-[#CCAA49] text-[#1A2634] px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-sm"
            >
              Assign Task
            </button>
            <div className="hidden md:flex items-center gap-4">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-red-500 hover:text-red-600 transition-all group border-r border-gray-100 pr-5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:translate-x-0.5 transition-transform">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  LOGOUT
                </button>
                <div className="w-8 h-8 rounded-full bg-[#1A2634] text-[#CCAA49] flex items-center justify-center font-black shadow-inner shadow-[#CCAA49]/20 border border-[#1A2634]">A</div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-3 bg-[#f8fafc] border-b border-gray-200 overflow-x-auto shadow-inner custom-scrollbar shrink-0 z-10 w-full">
          <Link to="/admin/tickets" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">Active Tickets</Link>
          <Link to="/admin/all-tickets" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">All Tickets</Link>
          <Link to="/admin/tasks" className="text-xs font-black text-white whitespace-nowrap bg-[#1A2634] px-4 py-2 rounded-lg border border-[#CCAA49]/60 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCAA49] animate-pulse"></span> Task Manager
          </Link>
          <Link to="/admin/all-tasks" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">All Tasks</Link>
        </div>

        {/* Active Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="w-full space-y-4">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-12 h-12 border-4 border-[#CCAA49]/20 border-t-[#CCAA49] rounded-full mb-4"
                />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Database...</p>
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2 opacity-50">No Active Loads</p>
                <p className="text-xs text-gray-400 font-medium">Initialize a dispatch to engage personnel.</p>
              </div>
            ) : (
              activeTasks.map((task, index) => (
                <motion.article 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  key={task.id} 
                  className="bg-white border-y sm:border sm:rounded-xl border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col md:flex-row group"
                >
                  {/* Left Status Color Strip */}
                  <div className={`hidden sm:block w-1.5 shrink-0 ${statusColors[task.status]?.bg || "bg-gray-200"}`}></div>

                  <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* Main Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center p-4 md:p-6 pb-2 md:pb-4 relative z-10 border-b border-gray-50">
                      
                      {/* Mobile Top Strip */}
                      <div className="flex sm:hidden items-center gap-2 mb-3">
                         <div className={`w-2 h-2 rounded-full ${statusColors[task.status]?.bg || "bg-gray-200"}`}></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2634]">{task.status.replace("_", " ")}</span>
                      </div>

                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3 pr-4 min-w-0">
                           <span className={`hidden sm:inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-gray-200 ${statusColors[task.status]?.text} ${statusColors[task.status]?.bg}`}>
                             {task.status.replace("_", " ")}
                           </span>
                           <h3 className="font-black text-lg text-[#1A2634] truncate">{task.task_name}</h3>
                        </div>
                        <span className="shrink-0 text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono pt-1">
                          TSK-{task.id.toString().padStart(4, "0")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Assigned To</p>
                          <p className="text-xs font-bold text-[#CCAA49] truncate">{task.assigned_user?.name || `ID: ${task.assigned_user_id}`}</p>
                        </div>
                        <div className="col-span-1 md:col-span-1 lg:col-span-3">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Timeframe</p>
                           <p className="text-xs font-bold text-[#1A2634]">{new Date(task.start_date).toLocaleString()} — {new Date(task.end_date).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description Area */}
                    <div className="w-full shrink-0 p-4 md:p-6 bg-white flex items-center border-b border-gray-50 md:border-b-0">
                      <p className="text-sm text-gray-700 italic border-l-2 border-[#123765] pl-4 py-1 leading-relaxed">"{task.description}"</p>
                    </div>

                  </div>
                  
                  {/* Task Update Controls */}
                  <div className="flex flex-col border-t md:border-t-0 md:border-l border-gray-100 bg-[#f8fafc] shrink-0 w-full md:w-64">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Update Lifecycle</p>
                      <select 
                        value={task.status} 
                        onChange={(e) => handleUpdateTask(task.id, { status: e.target.value })}
                        className="w-full bg-white border border-[#CCAA49]/30 text-[#1A2634] text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg outline-none focus:border-[#CCAA49] focus:ring-2 focus:ring-[#CCAA49]/20 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    </div>
                    <div className="p-4 flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Progress Notes</p>
                      <input 
                        className="w-full bg-white border border-gray-200 text-[#1A2634] text-xs font-medium py-2 px-3 rounded-lg outline-none focus:border-[#123765] transition-all shadow-sm"
                        placeholder="Add remarks..."
                        onBlur={(e) => handleUpdateTask(task.id, { remarks: e.target.value })}
                        defaultValue={task.remarks}
                      />
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </div>
      </main>

      {/* --- TASK CREATION MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2634]/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#1A2634] px-8 py-6 flex justify-between items-center shrink-0 border-b border-[#CCAA49]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCAA49] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Logistics Definition</h2>
                  <p className="text-[10px] text-[#CCAA49] font-bold mt-1 uppercase tracking-[0.2em]">Deploy system task</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors relative z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
                <form onSubmit={handleSubmit} id="taskForm" className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Task Nomenclature</label>
                    <input 
                      required
                      placeholder="e.g. Server Maintenance"
                      className="modern-input" 
                      value={formData.task_name}
                      onChange={(e) => setFormData({...formData, task_name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Personnel</label>
                    <select 
                      required
                      className="modern-input appearance-none" 
                      value={formData.assigned_user_id}
                      onChange={(e) => setFormData({...formData, assigned_user_id: e.target.value})}
                    >
                      <option value="">-- SELECT PERSONNEL --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Execution Start</label>
                      <input 
                        type="datetime-local" required
                        className="modern-input text-xs" 
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Execution Deadline</label>
                      <input 
                        type="datetime-local" required
                        className="modern-input text-xs" 
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Status</label>
                     <select 
                        className="modern-input appearance-none" 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Technical Briefing</label>
                    <textarea 
                      rows="4"
                      placeholder="Detail the execution parameters..."
                      className="modern-input resize-none" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-gray-100 flex justify-end shrink-0 gap-3 rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#1A2634] hover:bg-gray-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="taskForm"
                  className="px-6 py-3 bg-[#123765] hover:bg-[#1A2634] text-[#CCAA49] text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 border border-[#CCAA49]/20"
                >
                  Issue Dispatch Directive
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1A2634;
          outline: none;
          transition: all 0.2s ease;
        }
        .modern-input:focus {
          border-color: #CCAA49;
          box-shadow: 0 0 0 4px rgba(204, 170, 73, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(204, 170, 73, 0.4); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(204, 170, 73, 0.8); }
      `}} />
    </div>
  );
}
