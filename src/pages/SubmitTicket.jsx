import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "IT",
    ticket_about: "",
    status: "Medium",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const colors = {
    Urgent: {
      bg: "bg-[#1A2634]",
      text: "text-white",
      border: "border-[#1A2634]",
    },
    High: {
      bg: "bg-[#CCAA49]",
      text: "text-white",
      border: "border-[#CCAA49]",
    },
    Medium: {
      bg: "bg-[#123765]",
      text: "text-white",
      border: "border-[#123765]",
    },
    Low: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tickets", formData);
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "IT",
        ticket_about: "",
        status: "Medium",
      });
      fetchTickets();
      alert("Ticket Submitted Successfully.");
    } catch (err) {
      alert("Connection failed.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans antialiased">
      {/* --- SHARED NAVBAR --- */}
      <nav className="h-16 flex-none bg-[#1A2634] text-white flex items-center justify-between px-8 border-b border-[#CCAA49]/20 z-50 shadow-md">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-[#CCAA49] text-2xl font-black tracking-tighter italic"
          >
            NetDock
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link
              to="/"
              className="text-[#CCAA49] border-b-2 border-[#CCAA49] pb-1"
            >
              Submit Ticket
            </Link>
            <Link
              to="/book-room"
              className="hover:text-[#CCAA49] transition border-b-2 border-transparent hover:border-[#CCAA49] pb-1"
            >
              Book a Room!
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {token && role === "admin" ? (
            <button
              onClick={handleLogout}
              className="text-[10px] font-black uppercase bg-red-900/40 px-4 py-2 hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-[10px] font-black uppercase bg-[#123765] border border-[#CCAA49]/30 px-4 py-2 hover:bg-[#CCAA49] hover:text-[#1A2634] transition"
            >
              IT Personnel Login
            </Link>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* --- SIDEBAR: TERMINAL STYLE --- */}
        <aside className="w-[400px] h-full bg-white border-r border-gray-200 flex flex-col shadow-2xl z-30 overflow-hidden">
          {/* Header Section */}
          <div className="p-10 pb-6">
            <div className="w-12 h-1 bg-[#CCAA49] mb-6"></div>
            <h1 className="text-3xl font-black text-[#1A2634] tracking-tighter uppercase italic leading-none">
              Create Ticket
            </h1>
            {/* <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-[0.4em] flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#CCAA49]"></span>
              Incident Dispatch Portal
            </p> */}
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 px-10 pb-10 space-y-7 overflow-y-auto custom-scrollbar pt-4"
          >
            {/* Requester Name */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49] transition-colors">
                Requester Name
              </label>
              <input
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 border-l-4 border-l-gray-300 text-[11px] font-black text-[#1A2634] outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-[#CCAA49] focus:border-l-[#CCAA49] focus:ring-4 focus:ring-[#CCAA49]/5"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49] transition-colors">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 border-l-4 border-l-gray-300 text-[11px] font-black text-[#1A2634] outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-[#CCAA49] focus:border-l-[#CCAA49] focus:ring-4 focus:ring-[#CCAA49]/5"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="office@company.com"
              />
            </div>

            {/* Phone Number Field */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49] transition-colors">
                Phone Number
              </label>
              <input
                type="tel"
                required
                maxLength="11"
                className="w-full p-4 bg-gray-50 border border-gray-100 border-l-4 border-l-gray-300 text-[11px] font-black text-[#1A2634] outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-[#CCAA49] focus:border-l-[#CCAA49] focus:ring-4 focus:ring-[#CCAA49]/5"
                value={formData.phone}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: value });
                }}
                placeholder="09XXXXXXXXX"
              />
            </div>

            {/* Dept & Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-[#CCAA49] tracking-[0.2em] ml-1">
                  Dept
                </label>
                <select
                  className="w-full p-4 bg-gray-50 border border-gray-100 border-l-4 border-l-[#CCAA49] text-[11px] font-black text-[#1A2634] outline-none transition-all cursor-pointer focus:bg-white"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  <option value="IT">IT Support</option>
                  <option value="HR">HR Dept</option>
                  <option value="Finance">Finance</option>
                  <option value="Facility">Facility</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-[#CCAA49] tracking-[0.2em] ml-1">
                  Priority
                </label>
                <select
                  className="w-full p-4 bg-gray-50 border border-gray-100 border-l-4 border-l-[#CCAA49] text-[11px] font-black text-[#1A2634] outline-none transition-all cursor-pointer focus:bg-white"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Issue Description */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49] transition-colors">
                Issue Description
              </label>
              <textarea
                required
                rows="4"
                className="w-full p-4 bg-gray-50 border border-gray-100 border-l-4 border-l-gray-300 text-[11px] font-black text-[#1A2634] outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-[#CCAA49] focus:border-l-[#CCAA49] focus:ring-4 focus:ring-[#CCAA49]/5 resize-none"
                value={formData.ticket_about}
                onChange={(e) =>
                  setFormData({ ...formData, ticket_about: e.target.value })
                }
                placeholder="Briefly describe the situation..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-[#1A2634] hover:bg-[#123765] text-[#CCAA49] font-black py-5 rounded-none transition-all tracking-[0.3em] text-[10px] shadow-2xl active:translate-y-1 border border-[#CCAA49]/20 flex items-center justify-center gap-3 group"
              >
                <span>Submit Ticket</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <p className="text-[8px] text-gray-300 font-bold tracking-[0.4em] text-center mt-6 italic">
                System v1
              </p>
            </div>
          </form>

          <style
            dangerouslySetInnerHTML={{
              __html: `
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCAA49; }
  `,
            }}
          />
        </aside>

        {/* --- MAIN FEED --- */}
        <main className="flex-1 h-full flex flex-col bg-[#f8fafc]">
          <header className="px-10 py-8 bg-white border-b border-gray-100 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-[#1A2634] tracking-tighter italic">
                LIVE QUEUE
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">
                Active Operational Tickets
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Queue Count
              </p>
              <p className="text-4xl font-black text-[#123765] leading-none">
                {tickets.length}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tickets
                .filter((t) => t.status !== "Closed")
                .map((ticket) => (
                  <article
                    key={ticket.id}
                    className="bg-white rounded-none border border-gray-200 shadow-sm hover:shadow-xl transition-all flex flex-col group overflow-hidden"
                  >
                    <div
                      className={`h-1.5 w-full ${colors[ticket.status]?.bg}`}
                    ></div>
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <span
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${colors[ticket.status]?.border} ${colors[ticket.status]?.text} ${colors[ticket.status]?.bg}`}
                        >
                          {ticket.status}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-300">
                          T-#{ticket.id.toString().padStart(4, "0")}
                        </span>
                      </div>
                      <h3 className="font-black text-xl text-[#1A2634] mb-1 uppercase tracking-tight">
                        {ticket.name}
                      </h3>
                      <p className="text-[11px] font-bold text-[#CCAA49] mb-6 uppercase tracking-widest">
                        {ticket.department} Department
                      </p>
                      <div className="p-5 bg-gray-50 text-sm text-gray-600 leading-relaxed italic border border-gray-100">
                        "{ticket.ticket_about}"
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: SHARED_STYLES }} />
    </div>
  );
}

const SHARED_STYLES = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCAA49; }
`;
