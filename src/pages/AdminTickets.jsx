import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
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

  // --- UPDATED STATISTICS ---
  const stats = {
    // Total represents only the ACTIVE queue now
    total: tickets.filter((t) => t.status !== "Closed").length,
    open: tickets.filter((t) => t.status === "Urgent" || t.status === "High").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  // --- UPDATED FILTER LOGIC ---
  const filteredTickets = tickets.filter((t) => {
    const matchesDept = filterDept === "" || t.department === filterDept;
    const matchesStatus = filterStatus === "" || t.status === filterStatus;
    const isNotClosed = t.status !== "Closed"; // This removes 'Closed' tickets from view
    return matchesDept && matchesStatus && isNotClosed;
  });

  const statusColors = {
    Urgent: "bg-red-500 text-white border-red-600",
    High: "bg-[#CCAA49] text-white border-[#CCAA49]",
    Medium: "bg-[#123765] text-white border-[#123765]",
    Low: "bg-gray-100 text-gray-500 border-gray-200",
    Resolved: "bg-green-600 text-white border-green-700",
    Closed: "bg-black text-white border-black",
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans antialiased">
      <nav className="h-16 flex-none bg-[#1A2634] text-white flex items-center justify-between px-8 border-b border-[#CCAA49]/20 z-50 shadow-md">
        <div className="flex items-center gap-10">
          <Link to="/admin/tickets" className="text-[#CCAA49] text-2xl font-black tracking-tighter italic">NetDock</Link>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link to="/admin/tickets" className="text-[#CCAA49] border-b-2 border-[#CCAA49] pb-1">Active Tickets</Link>
            <Link to="/admin/tasks" className="hover:text-[#CCAA49] transition">Task Manager</Link>
            <Link to="/admin/all-tickets" className="hover:text-[#CCAA49] transition">All Tickets</Link>        
          </div>
        </div>
        <button onClick={handleLogout} className="text-[10px] font-black uppercase bg-red-900/40 px-4 py-2 hover:bg-red-600 transition">
          Logout
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[350px] h-full bg-white border-r border-gray-200 flex flex-col shadow-2xl z-30 overflow-hidden">
          <div className="p-10 pb-6">
            <div className="w-12 h-1 bg-[#CCAA49] mb-6"></div>
            <h1 className="text-3xl font-black text-[#1A2634] tracking-tighter italic leading-none">Admin <br /> Console</h1>
            <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-[0.4em] flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Active Queue
            </p>
          </div>

          <div className="flex-1 px-10 space-y-8 overflow-y-auto custom-scrollbar pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#1A2634] p-5 border-l-4 border-[#CCAA49]">
                <p className="text-[9px] font-black text-[#CCAA49] uppercase tracking-widest">Active Queue</p>
                <p className="text-3xl font-black text-white">{stats.total}</p>
              </div>
              <div className="bg-gray-50 p-5 border-l-4 border-red-500">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">High Priority</p>
                <p className="text-3xl font-black text-[#1A2634]">{stats.open}</p>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filter Department</label>
                <select 
                  className="terminal-select" 
                  value={filterDept} 
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="IT">IT Support</option>
                  <option value="HR">HR Dept</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filter Status</label>
                <select 
                  className="terminal-select" 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  {/* <option value="Resolved">Resolved</option> */}
                </select>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 h-full flex flex-col bg-[#f8fafc]">
          <header className="px-10 py-8 bg-white border-b border-gray-100 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-[#1A2634] tracking-tighter italic uppercase">Operation Stream</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">Managing {filteredTickets.length} active dispatches</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="space-y-6">
              {filteredTickets.length === 0 ? (
                <div className="py-20 text-center border-4 border-dashed border-gray-200 opacity-50 uppercase font-black tracking-widest text-gray-400">No active tickets found</div>
              ) : (
                filteredTickets.map((ticket) => (
                  <article key={ticket.id} className="bg-white border border-gray-200 flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className={`w-1.5 h-full absolute left-0 top-0 ${statusColors[ticket.status]?.split(' ')[0]}`}></div>
                    
                    <div className="flex-1 p-8 ml-2">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                           <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${statusColors[ticket.status]}`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-bold text-[#CCAA49] uppercase tracking-widest">{ticket.department} Department</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gray-300">REF-ID: {ticket.id.toString().padStart(5, '0')}</span>
                      </div>

                      <h3 className="text-xl font-black text-[#1A2634] uppercase tracking-tight mb-2">
                        {ticket.name} <span className="text-sm font-medium text-gray-400 normal-case ml-2">({ticket.email})</span>
                      </h3>
                      
                      <div className="p-4 bg-gray-50 border border-gray-100 italic text-sm text-gray-600 leading-relaxed mb-4">
                        "{ticket.ticket_about}"
                      </div>
                    </div>

                    <div className="w-full md:w-64 bg-gray-50/50 border-l border-gray-100 p-8 flex flex-col justify-center gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Update Lifecycle</label>
                        <select 
                          value={ticket.status} 
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 text-[10px] font-black uppercase outline-none focus:border-[#CCAA49] transition-all cursor-pointer"
                        >
                          <option value="Urgent">Urgent</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                          {/* <option value="Resolved">Resolved</option> */}
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .terminal-select {
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
          text-transform: uppercase;
          cursor: pointer;
        }
        .terminal-select:focus {
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