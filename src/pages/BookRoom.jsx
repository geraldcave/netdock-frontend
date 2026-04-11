import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function BookRoom() {
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };
  const [filterDate, setFilterDate] = useState(""); 
  const [filterRoomId, setFilterRoomId] = useState("");
  
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [formData, setFormData] = useState({
    room_id: "",
    name: "",
    booking_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
  });

  const filteredBookings = bookings.filter((booking) => {
    const matchesDate = filterDate === "" || booking.booking_date === filterDate;
    const matchesRoom = filterRoomId === "" || booking.room_id.toString() === filterRoomId;
    
    // Check if the booking's end time is still in the future (or currently active)
    const endDateTime = new Date(`${booking.booking_date}T${booking.end_time}`);
    const now = new Date();
    const isNotPassed = endDateTime > now;

    return matchesDate && matchesRoom && isNotPassed;
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const roomRes = await api.get("/rooms");
      const roomData = Array.isArray(roomRes.data) ? roomRes.data : roomRes.data.data;
      setRooms(roomData || []);
      if (roomData && roomData.length > 0) {
        setFormData(prev => ({ ...prev, room_id: roomData[0].id }));
      }

      const bookingRes = await api.get("/bookings");
      const bookingData = Array.isArray(bookingRes.data) ? bookingRes.data : bookingRes.data.data;
      setBookings(bookingData || []);
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bookings", formData);
      setFormData({ ...formData, name: "" }); 
      fetchInitialData(); 
      setIsModalOpen(false);
      showToast("Reservation Confirmed.", "success");
    } catch (err) {
      showToast("Conflict Detected: Time slot unavailable.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans antialiased text-[#1A2634]">
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
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden lg:flex w-64 h-full bg-white border-r border-gray-200 flex-col shadow-sm z-30 flex-none shrink-0">
        <div className="p-6 h-full flex flex-col">
          <Link to="/" className="text-[#1A2634] text-2xl font-black tracking-tighter italic block mb-8">
            Net<span className="text-[#CCAA49]">Dock</span>
          </Link>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full bg-[#123765] hover:bg-[#1A2634] text-white font-bold py-3.5 px-4 rounded-lg shadow-[0_4px_12px_rgba(18,55,101,0.25)] transition-all flex items-center justify-center gap-2 mb-8"
          >
            <span>Book a Room</span>
          </button>
          
          <div className="space-y-6 flex-1">
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Bookings</h4>
               <Link to="/book-room" className="flex justify-between items-center text-sm font-bold text-[#123765] bg-[#123765]/5 px-3 py-2.5 rounded-lg border border-[#123765]/10">
                  <span>Upcoming</span>
                  <span className="bg-[#123765] text-white text-[10px] px-2 py-0.5 rounded-full">{filteredBookings.length}</span>
               </Link>
            </div>
            
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Navigation</h4>
               <div className="space-y-1">
                 <Link to="/" className="flex justify-between items-center text-sm font-medium text-gray-500 hover:text-[#1A2634] px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <span>Submit Ticket</span>
                 </Link>
                 <Link to="/book-room" className="flex justify-between items-center text-sm font-bold text-[#1A2634] px-3 py-2.5 rounded-lg bg-gray-50 text-left">
                    <span>Book a Room</span>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full flex flex-col bg-[#f8fafc] overflow-hidden">
        {/* Header */}
        <header className="px-6 lg:px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-black text-[#1A2634]">Room Reservations</h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold">
            {token && role === "admin" ? (
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
                 <div className="w-8 h-8 rounded-full bg-[#CCAA49] text-white flex items-center justify-center font-black">A</div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4">
                 <Link to="/login" className="flex items-center gap-2 px-4 py-2 border-2 border-[#CCAA49]/30 text-[#1A2634] text-[11px] font-black uppercase tracking-widest rounded-lg hover:border-[#CCAA49] hover:text-[#1A2634] hover:bg-[#CCAA49]/10 transition-all group shadow-sm hover:shadow-md">
                   <span>IT Login</span>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#CCAA49] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                 </Link>
                 <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="lg:hidden bg-[#123765] text-white px-4 py-2 rounded-lg text-xs"
                >
                  Book a Room
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-3 bg-[#f8fafc] border-b border-gray-200 overflow-x-auto shadow-inner custom-scrollbar shrink-0">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-[#1A2634] whitespace-nowrap px-4 py-2 transition-colors">
            Submit Ticket
          </Link>
          <Link to="/book-room" className="text-xs font-black text-[#123765] whitespace-nowrap bg-white px-4 py-2 rounded-lg border border-[#CCAA49]/40 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCAA49]"></span>
            Book a Room
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="px-6 lg:px-8 py-3 bg-white border-b border-gray-200 flex justify-between items-center shrink-0 shadow-sm z-10 flex-wrap gap-4">
           <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
             <span>Date Filter:</span>
             <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border-none bg-gray-50 rounded-md py-1 px-2 text-[#1A2634] outline-none font-bold" />
             
             <span className="ml-2">Room Filter:</span>
             <select value={filterRoomId} onChange={(e) => setFilterRoomId(e.target.value)} className="border-none bg-gray-50 rounded-md py-1 px-2 text-[#1A2634] outline-none font-bold">
               <option value="">All Rooms</option>
               {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
             </select>

             {(filterDate || filterRoomId) && (
                <button onClick={() => { setFilterDate(""); setFilterRoomId(""); }} className="ml-2 text-red-500 hover:text-red-700">Clear</button>
             )}
           </div>
           
           <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block">
             Active Leases
           </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
          <div className="flex flex-col gap-4 w-full pb-12">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-12 h-12 border-4 border-[#123765]/20 border-t-[#123765] rounded-full mb-4"
                />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Database...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl opacity-60">
                   <p className="font-black text-gray-400 tracking-[0.2em] uppercase">No Matchings Found</p>
                </div>
            ) : (
                filteredBookings.map((booking, index) => (
                  <motion.article
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    key={booking.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 flex flex-col md:flex-row items-stretch p-0 group transition-all relative overflow-hidden"
                  >
                    {/* Left Color Indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#123765]"></div>
                    
                    {/* Status & ID Column */}
                    <div className="w-full md:w-32 flex flex-row md:flex-col items-center justify-between md:justify-center p-4 md:p-6 md:border-r border-gray-100 shrink-0 bg-gray-50/50">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-auto md:w-full text-center bg-green-100 text-green-700">
                        Confirmed
                      </span>
                      <span className="text-[12px] font-bold text-gray-400 md:mt-3 font-mono">
                        #{booking.id.toString().padStart(4, "0")}
                      </span>
                    </div>
                    
                    {/* Main Details Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center p-4 md:p-6 pb-2 md:pb-6">
                      <h3 className="font-black text-lg text-[#1A2634] truncate mb-3">{booking.name}</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Target Room</p>
                          <p className="text-sm font-bold text-[#123765] truncate">{booking.room?.name || `Room ${booking.room_id}`}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Date</p>
                          <p className="text-sm font-medium text-gray-700">{booking.booking_date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Time</p>
                          <p className="text-sm font-medium text-[#CCAA49]">{booking.start_time} - {booking.end_time}</p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL FORM --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2634]/50 backdrop-blur-sm p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
                 <div>
                   <h2 className="text-2xl font-black text-[#1A2634] italic">Allocate Room</h2>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Resource Management</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <form onSubmit={handleBooking} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Occupant Personnel</label>
                    <input required className="modern-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#123765] uppercase tracking-widest pl-1">Target Resource</label>
                    <select className="modern-input cursor-pointer border-[#123765]/20 focus:border-[#123765]" value={formData.room_id} onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}>
                       {rooms.map((r) => (
                         <option key={r.id} value={r.id}>{r.name}</option>
                       ))}
                    </select>
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#CCAA49] uppercase tracking-widest pl-1">Effective Date</label>
                    <input type="date" required className="modern-input border-[#CCAA49]/40 focus:border-[#CCAA49]" value={formData.booking_date} onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })} />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">From Time</label>
                       <input type="time" required className="modern-input" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">To Time</label>
                       <input type="time" required className="modern-input" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-3 bg-[#1A2634] hover:bg-[#123765] text-[#CCAA49] font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2">
                       <span>Reserve</span>
                    </button>
                 </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1A2634;
          outline: none;
          transition: all 0.2s ease;
        }
        .modern-input:focus {
          background-color: #ffffff;
          border-color: #123765;
          box-shadow: 0 0 0 3px rgba(18,55,101,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}