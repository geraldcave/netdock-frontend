import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";

export default function AllTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) { console.error("Archive fetch failed:", err); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    delayed: tasks.filter(t => t.status === "delayed").length,
  };

  // Filters
  const filteredTasks = tasks.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = t.task_name.toLowerCase().includes(term) || (t.description && t.description.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    pending: { bg: "bg-gray-400", text: "text-white" },
    in_progress: { bg: "bg-[#123765]", text: "text-white" },
    completed: { bg: "bg-green-600", text: "text-white" },
    delayed: { bg: "bg-red-600", text: "text-white" },
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f8fafc] overflow-hidden font-sans antialiased text-[#1A2634]">
      
      {/* --- DESKTOP SIDEBAR (ADMIN DARK THEME) --- */}
      <aside className="hidden lg:flex w-72 h-full bg-[#1A2634] text-white flex-col shadow-2xl z-30 flex-none shrink-0 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCAA49] opacity-5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#123765] opacity-20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="p-6 h-full flex flex-col relative z-10 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="text-white text-2xl font-black tracking-tighter italic">
              Net<span className="text-[#CCAA49]">Dock</span>
            </Link>
            <span className="px-2 py-1 bg-[#CCAA49]/20 text-[#CCAA49] text-[9px] font-black uppercase tracking-widest rounded">Task Archive</span>
          </div>
          
          <div className="space-y-8 flex-1">
            {/* System Overview Dashboard */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Database Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#123765]/50 border border-[#123765] p-3 rounded-xl flex flex-col justify-center items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#CCAA49]">Total</span>
                  <span className="text-2xl font-black text-white leading-none mt-1">{stats.total}</span>
                </div>
                <div className="bg-green-900/40 border border-green-900/50 p-3 rounded-xl flex flex-col justify-center items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Done</span>
                  <span className="text-2xl font-black text-white leading-none mt-1">{stats.completed}</span>
                </div>
              </div>
            </div>

            {/* Tactical Filters */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Query Parameters</h4>
                 <button onClick={() => {setSearchTerm(""); setStatusFilter("");}} className="text-[9px] font-black text-[#CCAA49] uppercase tracking-widest hover:text-white transition-colors">Clear</button>
              </div>
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="SEARCH KEYWORDS..."
                  className="w-full bg-[#1A2634] border border-[#123765] text-white text-xs font-bold p-3 rounded-lg outline-none focus:border-[#CCAA49] transition-all placeholder:text-gray-500 uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select 
                  className="w-full bg-[#1A2634] border border-[#123765] text-white text-xs font-bold p-3 rounded-lg outline-none focus:border-[#CCAA49] transition-all appearance-none cursor-pointer"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">ALL STATUSES</option>
                  <option value="pending">PENDING</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                  <option value="delayed">DELAYED</option>
                </select>
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
                 <Link to="/admin/tasks" className="flex justify-between items-center text-sm font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#123765]/50 transition-colors text-left border border-transparent">
                    <span>Task Manager</span>
                 </Link>
                 <Link to="/admin/all-tasks" className="flex justify-between items-center text-sm font-bold text-[#1A2634] px-3 py-2.5 rounded-lg bg-[#CCAA49] text-left transition-all shadow-[0_0_15px_rgba(204,170,73,0.3)]">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> All Tasks</span>
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
             <h1 className="text-2xl font-black text-[#1A2634] uppercase italic tracking-tight">All Task Archive</h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-4">
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
          <Link to="/admin/tasks" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">Task Manager</Link>
          <Link to="/admin/all-tasks" className="text-xs font-black text-white whitespace-nowrap bg-[#1A2634] px-4 py-2 rounded-lg border border-[#CCAA49]/60 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCAA49] animate-pulse"></span> All Tasks
          </Link>
        </div>

        {/* Archive Ticket List */}
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
            ) : filteredTasks.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2 opacity-50">Zero Matches Found</p>
                <p className="text-xs text-gray-400 font-medium">No results found in the master database.</p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.article 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  key={task.id} 
                  className="bg-white border-y sm:border sm:rounded-xl border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col md:flex-row group"
                >
                  {/* Left Status Color Strip */}
                  <div className={`hidden sm:block w-1.5 shrink-0 ${statusColors[task.status]?.bg || "bg-gray-200"}`}></div>

                  <div className="flex-1 flex flex-col md:flex-row min-w-0">
                    
                    {/* Main Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center p-3 md:px-4 md:py-3 relative z-10 border-b md:border-b-0 md:border-r border-gray-100">
                      
                      {/* Mobile Top Strip */}
                      <div className="flex sm:hidden items-center gap-2 mb-3">
                         <div className={`w-2 h-2 rounded-full ${statusColors[task.status]?.bg || "bg-gray-200"}`}></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2634]">{task.status.replace("_", " ")}</span>
                      </div>

                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3 pr-4 min-w-0">
                           <span className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-widest text-[#1A2634] border border-[#1A2634]/10 bg-gray-50 px-1.5 py-0.5 rounded">
                             {task.status.replace("_", " ")}
                           </span>
                           <h3 className="font-black text-sm text-[#1A2634] truncate">{task.task_name}</h3>
                        </div>
                        <span className="shrink-0 text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono pt-1">
                          TSK-{task.id.toString().padStart(4, "0")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-4 mt-2">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Assignee</p>
                          <p className="text-xs font-bold text-[#CCAA49] truncate">{task.assigned_user?.name || `ID: ${task.assigned_user_id}`}</p>
                        </div>
                        <div className="col-span-1 md:col-span-1 lg:col-span-3">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Timeframe</p>
                           <p className="text-xs font-bold text-[#1A2634]">{new Date(task.start_date).toLocaleString()} — {new Date(task.end_date).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[40%] shrink-0 flex flex-col bg-gray-50/30">
                      {/* Description Area */}
                      <div className="p-3 md:px-4 flex-1 flex items-center">
                        <p className="text-xs text-gray-600 italic border-l-2 border-[#123765] pl-3 py-0.5 leading-snug line-clamp-2">"{task.description || "No description."}"</p>
                      </div>
                      
                      {/* Remarks Area */}
                      {task.remarks && (
                        <div className="p-3 md:px-4 bg-gray-50/80 flex items-center border-t border-gray-100 shrink-0">
                          <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mr-2">Note:</p>
                          <p className="text-[11px] text-[#1A2634] font-medium truncate">{task.remarks}</p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.article>
              ))
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(204, 170, 73, 0.4); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(204, 170, 73, 0.8); }
      `}} />
    </div>
  );
}
