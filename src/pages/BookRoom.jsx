import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function BookRoom() {
  const navigate = useNavigate();
  
  // 1. Define all State FIRST
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
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

  // 2. Define Derived State (Filters) AFTER the bookings state is defined
  const filteredBookings = bookings.filter((booking) => {
    const matchesDate = filterDate === "" || booking.booking_date === filterDate;
    const matchesRoom = filterRoomId === "" || booking.room_id.toString() === filterRoomId;
    return matchesDate && matchesRoom;
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const roomRes = await api.get("/rooms");
      const roomData = Array.isArray(roomRes.data) ? roomRes.data : roomRes.data.data;
      setRooms(roomData || []);

      if (roomData?.length > 0) {
        setFormData((prev) => ({ ...prev, room_id: roomData[0].id }));
      }

      const bookingRes = await api.get("/bookings");
      const bookingData = Array.isArray(bookingRes.data) ? bookingRes.data : bookingRes.data.data;
      setBookings(bookingData || []);
      console.log("Bookings received:", bookingData);
    } catch (err) {
      console.error("Data fetch failed:", err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bookings", formData);
      setFormData({ ...formData, name: "" }); 
      fetchInitialData(); 
      alert("Reservation Confirmed.");
    } catch (err) {
      alert("Conflict Detected: Time slot unavailable.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans">
      <nav className="h-16 flex-none bg-[#1A2634] text-white flex items-center justify-between px-8 border-b border-[#CCAA49]/20 z-50">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-[#CCAA49] text-2xl font-black tracking-tighter italic">
            NetDock
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link to="/" className="hover:text-[#CCAA49] transition">Submit Ticket</Link>
            <Link to="/book-room" className="text-[#CCAA49] border-b-2 border-[#CCAA49] pb-1">Book a Room!</Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {token && role === "admin" ? (
            <button onClick={handleLogout} className="text-[10px] font-black uppercase bg-red-900/40 px-4 py-2 hover:bg-red-600 transition">Logout</button>
          ) : (
            <Link to="/login" className="text-[10px] font-black uppercase bg-[#123765] px-4 py-2 border border-[#CCAA49]/30">IT Personnel Login</Link>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[400px] h-full bg-white border-r border-gray-200 flex flex-col shadow-2xl z-30 overflow-hidden">
          <div className="p-10 pb-6">
            <div className="w-12 h-1 bg-[#CCAA49] mb-6"></div>
            <h1 className="text-3xl font-black text-[#1A2634] tracking-tighter italic leading-none">
              Room  Reservation
            </h1>
            {/* <p className="text-[10px] text-gray-400 font-bold mt-3 tracking-[0.4em] flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#CCAA49]"></span>
              Allocate Resources
            </p> */}
          </div>

          <form onSubmit={handleBooking} className="flex-1 px-10 pb-10 space-y-7 overflow-y-auto custom-scrollbar pt-4">
            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 group-focus-within:text-[#CCAA49] transition-colors">
                Occupant Personnel
              </label>
              <input
                required
                className="modern-terminal-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-[#CCAA49] tracking-[0.2em] ml-1">
                Target Resource (Room)
              </label>
              <select
                className="modern-terminal-input cursor-pointer"
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1">
                Lease Effective Date
              </label>
              <input
                type="date"
                required
                className="modern-terminal-input"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group space-y-2">
                <label className="text-[9px] font-black text-gray-400 tracking-widest ml-1">From</label>
                <input
                  type="time"
                  className="modern-terminal-input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="group space-y-2">
                <label className="text-[9px] font-black text-gray-400 tracking-widest ml-1">To</label>
                <input
                  type="time"
                  className="modern-terminal-input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-[#1A2634] hover:bg-[#123765] text-[#CCAA49] font-black py-5 rounded-none transition-all tracking-[0.3em] text-[10px] shadow-2xl active:translate-y-1 border border-[#CCAA49]/20 flex items-center justify-center gap-3 group"
              >
                <span>Book it!</span>
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
        </aside>

        <main className="flex-1 h-full flex flex-col bg-[#f8fafc]">
          <header className="px-10 py-6 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-3xl font-black text-[#1A2634] tracking-tighter italic">Active Leases</h2>
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.3em] mt-2">Currently Reserved Resources</p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-[#CCAA49] tracking-widest ml-1">Filter Date</label>
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-white border border-gray-200 text-[10px] font-bold p-2 outline-none focus:border-[#CCAA49]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-[#CCAA49] tracking-widest ml-1">Filter Room</label>
                <select 
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                  className="bg-white border border-gray-200 text-[10px] font-bold p-2 outline-none focus:border-[#CCAA49] min-w-[140px]"
                >
                  <option value="">ALL RESOURCES</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => { setFilterDate(""); setFilterRoomId(""); }}
                className="mt-4 px-3 py-2 text-[9px] font-black bg-[#1A2634] text-white hover:bg-[#CCAA49] transition-colors"
              >
                Reset
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.length === 0 ? (
                <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-100 opacity-40">
                  <p className="font-black text-gray-300 tracking-[0.5em]">No Matching Schedules Found</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <article key={booking.id} className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#CCAA49]"></div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-gray-400 tracking-widest">
                        Room: <span className="text-[#123765]">{booking.room?.name || `ID ${booking.room_id}`}</span>
                      </span>
                      <span className="text-[9px] font-mono text-gray-300">#{booking.id}</span>
                    </div>
                    <h3 className="text-xl font-black text-[#1A2634] tracking-tight mb-1">{booking.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] font-bold text-gray-400 tracking-widest">Confirmed Lease</span>
                    </div>
                    <div className="bg-gray-50 p-4 border border-gray-100 space-y-2">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-gray-400">Date</span>
                        <span className="text-[#1A2634]">{booking.booking_date}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-[#CCAA49]">{booking.start_time} - {booking.end_time}</span>
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
        .modern-terminal-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-left: 4px solid #e2e8f0;
          font-size: 0.75rem;
          font-weight: 800;
          color: #1A2634;
          outline: none;
          transition: all 0.2s ease;
        }
        .modern-terminal-input:focus {
          background-color: #ffffff;
          border-color: #CCAA49;
          border-left-color: #CCAA49;
          box-shadow: 15px 15px 30px rgba(0,0,0,0.03);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCAA49; }
      `}} />
    </div>
  );
}