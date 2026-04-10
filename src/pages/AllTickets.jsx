import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";

export default function AllTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) { console.error("Archive fetch failed:", err); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- ANALYTICS CALCULATIONS ---
  const stats = {
    total: tickets.length,
    urgent: tickets.filter(t => t.status === "Urgent").length,
    resolved: tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length,
    active: tickets.filter(t => t.status !== "Resolved" && t.status !== "Closed").length,
  };

  // --- FILTER LOGIC ---
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.ticket_about.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || t.status === statusFilter;
    const matchesDept = deptFilter === "" || t.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="flex flex-col min-h-screen lg:h-screen w-full bg-[#fcfcfd] overflow-x-hidden lg:overflow-hidden font-sans antialiased">
      {/* --- SHARED IT NAVBAR --- */}
      <nav className="h-auto md:h-16 flex-none bg-[#1A2634] text-white flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 md:py-0 border-b border-[#CCAA49]/20 z-50 gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          <div className="flex justify-between items-center w-full md:w-auto">
            <Link to="/admin/tickets" className="text-[#CCAA49] text-2xl font-black tracking-tighter italic">NetDock</Link>
            <button onClick={handleLogout} className="md:hidden text-[10px] font-black uppercase bg-red-900/40 px-4 py-2 hover:bg-red-600 transition">Logout</button>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Link to="/admin/tickets" className="hover:text-white transition">Active Tickets</Link>
            <Link to="/admin/tasks" className="hover:text-white transition">Task Manager</Link>
            <Link to="/admin/all-tickets" className="text-[#CCAA49] border-b-2 border-[#CCAA49] pb-1">All Tickets</Link>
          </div>
        </div>
        <button onClick={handleLogout} className="hidden md:block text-[10px] font-black uppercase bg-red-900/40 px-4 py-2 hover:bg-red-600 transition">Logout</button>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        {/* --- SIDEBAR: ANALYTICS & SEARCH --- */}
        <aside className="w-full lg:w-[400px] lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shadow-lg z-30 lg:overflow-hidden flex-none">
          <div className="p-6 md:p-10 pb-4 md:pb-6">
            <div className="w-12 h-1 bg-[#CCAA49] mb-6"></div>
            <h1 className="text-3xl font-black text-[#1A2634] tracking-tighter italic leading-none">Global <br /> Archive</h1>
            <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-[0.4em] flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#CCAA49]"></span> Data Repository
            </p>
          </div>

          <div className="flex-1 px-6 md:px-10 pb-8 md:pb-10 space-y-8 lg:overflow-y-auto custom-scrollbar pt-4">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A2634] p-4 border-l-4 border-[#CCAA49]">
                <p className="text-[8px] font-black text-[#CCAA49] uppercase tracking-widest">Total Records</p>
                <p className="text-2xl font-black text-white">{stats.total}</p>
              </div>
              <div className="bg-gray-50 p-4 border-l-4 border-red-500">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Urgent Only</p>
                <p className="text-2xl font-black text-[#1A2634]">{stats.urgent}</p>
              </div>
              <div className="bg-gray-50 p-4 border-l-4 border-green-500">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Resolved</p>
                <p className="text-2xl font-black text-[#1A2634]">{stats.resolved}</p>
              </div>
              <div className="bg-gray-50 p-4 border-l-4 border-[#123765]">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Ops</p>
                <p className="text-2xl font-black text-[#1A2634]">{stats.active}</p>
              </div>
            </div>

            {/* Search Terminal */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Search Keywords</label>
                <input 
                  className="modern-terminal-input" 
                  placeholder="FIND NAME OR ISSUE..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Department Scope</label>
                <select className="modern-terminal-input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="">ALL DEPARTMENTS</option>
                  <option value="IT">IT SUPPORT</option>
                  <option value="HR">HR Department</option>
                  <option value="FINANCE">FINANCE</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status Lifecycle</label>
                <select className="modern-terminal-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">ALL STATUSES</option>
                  <option value="Urgent">URGENT</option>
                  <option value="High">HIGH PRIORITY</option>
                  <option value="Resolved">RESOLVED</option>
                  <option value="Closed">CLOSED</option>
                </select>
              </div>

              <button 
                onClick={() => {setSearchTerm(""); setStatusFilter(""); setDeptFilter("");}}
                className="w-full py-4 text-[10px] font-black bg-[#1A2634] text-white uppercase tracking-widest hover:bg-[#CCAA49] transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* --- MAIN: FULL RECORD LIST --- */}
        <main className="flex-1 lg:h-full flex flex-col bg-[#f8fafc]">
          <header className="px-6 py-6 md:px-10 md:py-8 bg-white border-b border-gray-100 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-[#1A2634] tracking-tighter italic uppercase leading-none">Record Stream</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">Showing {filteredTickets.length} results from master database</p>
            </div>
          </header>

          <div className="flex-1 lg:overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.length === 0 ? (
                <div className="py-20 text-center opacity-40 uppercase font-black tracking-[0.5em] text-gray-400">Zero matches found in archive</div>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    key={ticket.id} 
                    className="bg-white border border-gray-100 flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 shadow-sm hover:shadow-md transition-all group gap-4 md:gap-0"
                  >
                    <div className={`hidden md:block w-1 h-12 ${ticket.status === 'Urgent' ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    
                    <div className="flex-1 w-full md:px-6 grid grid-cols-2 md:grid-cols-4 items-start md:items-center gap-4 md:gap-6">
                      <div className={`md:border-none border-l-4 pl-3 md:pl-0 ${ticket.status === 'Urgent' ? 'border-red-500' : 'border-gray-200'}`}>
                        <p className="text-[8px] font-black text-gray-300 uppercase">Requester</p>
                        <p className="text-xs font-black text-[#1A2634] truncate">{ticket.name}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-gray-300 uppercase">Department</p>
                        <p className="text-xs font-bold text-[#CCAA49]">{ticket.department}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[8px] font-black text-gray-300 uppercase">Current State</p>
                        <p className="text-[10px] font-black text-[#123765] uppercase">{ticket.status}</p>
                      </div>
                      <div className="text-left md:text-right">
                         <p className="text-[8px] font-black text-gray-300 uppercase">Submission</p>
                         <p className="text-[10px] font-mono text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <Link 
                      to="/admin/tickets" 
                      className="w-full md:w-auto text-center px-6 py-3 md:py-2 border border-gray-100 text-[9px] font-black uppercase text-gray-400 hover:text-[#CCAA49] hover:border-[#CCAA49] transition-all mt-2 md:mt-0"
                    >
                      View Details
                    </Link>
                  </motion.article>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCAA49; }
      `}} />
    </div>
  );
}