import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tickets/${id}`, { status: newStatus });
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Stats Logic
  const activeTickets = tickets.filter((t) => t.status !== "Closed");
  const stats = {
    total: activeTickets.length,
    open: activeTickets.filter((t) => t.status === "Urgent" || t.status === "High").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  // Filter Logic
  const filteredTickets = activeTickets.filter((t) => {
    const matchesDept = filterDept === "" || t.department === filterDept;
    const matchesStatus = filterStatus === "" || t.status === filterStatus;
    return matchesDept && matchesStatus;
  });

  const statusColors = {
    Urgent: { bg: "bg-[#1A2634]", text: "text-white" },
    High: { bg: "bg-[#CCAA49]", text: "text-white" },
    Medium: { bg: "bg-[#123765]", text: "text-white" },
    Low: { bg: "bg-gray-400", text: "text-white" },
    Resolved: { bg: "bg-green-600", text: "text-white" },
    Closed: { bg: "bg-black", text: "text-white" },
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
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded">Admin</span>
          </div>
          
          <div className="space-y-8 flex-1">
            {/* System Overview Dashboard */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">System Overview</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#123765]/50 border border-[#123765] p-3 rounded-xl flex flex-col justify-center items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#CCAA49]">Queue</span>
                  <span className="text-2xl font-black text-white leading-none mt-1">{stats.total}</span>
                </div>
                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl flex flex-col justify-center items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-400">High Priority</span>
                  <span className="text-2xl font-black text-white leading-none mt-1">{stats.open}</span>
                </div>
              </div>
            </div>

            {/* Tactical Filters */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tactical Filters</h4>
              <div className="space-y-2">
                <select 
                  className="w-full bg-[#123765]/30 border border-[#123765] text-white text-xs font-bold p-3 rounded-lg outline-none focus:border-[#CCAA49] transition-all appearance-none cursor-pointer"
                  value={filterDept} 
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="" className="bg-[#1A2634] text-white font-bold">ALL DEPARTMENTS</option>
                  <option value="IT" className="bg-[#1A2634] text-white font-bold">IT DEPARTMENT</option>
                  <option value="HR" className="bg-[#1A2634] text-white font-bold">HR DEPARTMENT</option>
                  <option value="Finance" className="bg-[#1A2634] text-white font-bold">FINANCE DEPT</option>
                </select>
                
                <select 
                  className="w-full bg-[#123765]/30 border border-[#123765] text-white text-xs font-bold p-3 rounded-lg outline-none focus:border-[#CCAA49] transition-all appearance-none cursor-pointer"
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="" className="bg-[#1A2634] text-white font-bold">ALL STATUSES</option>
                  <option value="Urgent" className="bg-[#1A2634] text-white font-bold">URGENT</option>
                  <option value="High" className="bg-[#1A2634] text-white font-bold">HIGH PRIORITY</option>
                  <option value="Medium" className="bg-[#1A2634] text-white font-bold">MEDIUM</option>
                  <option value="Low" className="bg-[#1A2634] text-white font-bold">LOW</option>
                </select>
              </div>
            </div>
            
            {/* Global Navigation */}
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Command Interfaces</h4>
               <div className="space-y-1">
                 <Link to="/admin/tickets" className="flex justify-between items-center text-sm font-bold text-[#1A2634] px-3 py-2.5 rounded-lg bg-[#CCAA49] text-left transition-all shadow-[0_0_15px_rgba(204,170,73,0.3)]">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Active Tickets</span>
                 </Link>
                 <Link to="/admin/all-tickets" className="flex justify-between items-center text-sm font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#123765]/50 transition-colors text-left border border-transparent">
                    <span>All Tickets (Archive)</span>
                 </Link>
                 <Link to="/admin/tasks" className="flex justify-between items-center text-sm font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#123765]/50 transition-colors text-left border border-transparent">
                    <span>Task Manager</span>
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
             <h1 className="text-2xl font-black text-[#1A2634] uppercase italic tracking-tight">Active Tickets</h1>
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
          <Link to="/admin/tickets" className="text-xs font-black text-white whitespace-nowrap bg-[#1A2634] px-4 py-2 rounded-lg border border-[#CCAA49]/60 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCAA49] animate-pulse"></span> Active Tickets
          </Link>
          <Link to="/admin/all-tickets" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">All Tickets</Link>
          <Link to="/admin/tasks" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">Task Manager</Link>
          <Link to="/admin/all-tasks" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">All Tasks</Link>
        </div>

        {/* Active Ticket List */}
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
            ) : filteredTickets.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2 opacity-50">No Active Data</p>
                <p className="text-xs text-gray-400 font-medium">Verify your filters or check the global archive.</p>
              </div>
            ) : (
              filteredTickets.map((ticket, index) => (
                <motion.article 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  key={ticket.id} 
                  className="bg-white border-y sm:border sm:rounded-xl border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col md:flex-row group"
                >
                  {/* Left Status Color Strip */}
                  <div className={`hidden sm:block w-1.5 shrink-0 ${statusColors[ticket.status]?.bg || "bg-gray-200"}`}></div>

                  <div className="flex-1 flex flex-col md:flex-row min-w-0">
                    
                    {/* Main Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center p-4 md:p-6 pb-2 md:pb-6 relative z-10">
                      
                      {/* Mobile Top Strip */}
                      <div className="flex sm:hidden items-center gap-2 mb-3">
                         <div className={`w-2 h-2 rounded-full ${statusColors[ticket.status]?.bg || "bg-gray-200"}`}></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2634]">{ticket.status}</span>
                      </div>

                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-lg text-[#1A2634] truncate mb-1 pr-4">{ticket.name}</h3>
                        <span className="hidden md:inline-flex text-[9px] font-black text-gray-300 uppercase tracking-widest font-mono">
                          #{ticket.id.toString().padStart(4, "0")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Department</p>
                          <p className="text-xs font-bold text-[#CCAA49] truncate">{ticket.department}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact</p>
                          <p className="text-xs font-medium text-gray-700 truncate">{ticket.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description Area */}
                    <div className="w-full lg:w-[280px] shrink-0 p-4 md:p-6 pt-0 md:pt-6 md:border-l border-gray-100 flex items-center bg-gray-50/50">
                      <p className="text-xs text-gray-500 italic line-clamp-2 leading-relaxed">"{ticket.ticket_about}"</p>
                    </div>
                  </div>
                  
                  {/* Action Column (Admin specific) */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center p-4 border-t md:border-t-0 md:border-l border-gray-100 bg-[#f8fafc] shrink-0 gap-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest hidden md:block">Update Lifecycle</p>
                    <select 
                      value={ticket.status} 
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="w-full bg-white border border-[#CCAA49]/30 text-[#1A2634] text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg outline-none focus:border-[#CCAA49] focus:ring-2 focus:ring-[#CCAA49]/20 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
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