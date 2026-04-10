import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="h-16 bg-[#1A2634] text-white flex items-center justify-between px-8 border-b border-[#CCAA49]/20 shadow-lg z-50">
            <div className="flex items-center gap-10">
                <Link to="/" className="text-[#CCAA49] text-2xl font-black tracking-tighter italic">
                    NetDock
                </Link>
                
                <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
                    <Link to="/" className="hover:text-[#CCAA49] transition">Submit Ticket</Link>
                    <Link to="/resources" className="hover:text-[#CCAA49] transition">Resources</Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {token && role === 'admin' ? (
                    <>
                        <Link to="/admin/tickets" className="text-[10px] font-black uppercase border border-[#CCAA49] px-4 py-2 hover:bg-[#CCAA49] hover:text-[#1A2634] transition">
                            Admin Dashboard
                        </Link>
                        <button onClick={handleLogout} className="text-[10px] font-black uppercase bg-red-900/50 px-4 py-2 hover:bg-red-600 transition">
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="text-[10px] font-black uppercase bg-[#123765] border border-[#CCAA49]/30 px-4 py-2 hover:bg-[#CCAA49] hover:text-[#1A2634] transition">
                        IT Personnel Login
                    </Link>
                )}
            </div>
        </nav>
    );
}