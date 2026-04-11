import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await api.post('/login', { email, password });
            
            // Store credentials securely
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            
            if (res.data.user.role === 'admin') {
                navigate('/admin/tickets');
            } else {
                setError('Access Denied: IT Personnel Only.');
                localStorage.clear(); 
            }
        } catch (err) {
            setError('Verification failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row font-sans antialiased">
            
            {/* LEFT SIDE: Visual Brand Area (Hidden on mobile) */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden md:flex md:w-5/12 bg-[#1A2634] p-16 flex-col justify-between relative overflow-hidden"
            >
                {/* Subtle Decorative Background Element */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#CCAA49] opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#123765] opacity-20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <h1 className="text-[#CCAA49] text-3xl font-black tracking-tighter italic">
                        NetDock
                    </h1>
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-white text-6xl font-black tracking-tighter leading-[0.9] mb-6">
                        ADMIN<br />GATEWAY
                    </h2>
                    {/* <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
                        Secure internal access for IT Personnel. Monitor system health and manage active dispatches.
                    </p> */}
                </div>
                
                <div className="relative z-10 flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[1px] bg-gray-700"></span>
                    {/* Internal Operations Secure */}
                    <Link to="/" className="hover:text-white transition">Dashboard</Link>
                </div>
            </motion.div>

            {/* RIGHT SIDE: Authentication Form */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 flex items-center justify-center p-8 md:p-24 bg-white"
            >
                <div className="w-full max-w-md relative">
                    
                    {/* MOBILE ONLY BACK BUTTON */}
                    <Link to="/" className="md:hidden flex items-center gap-2 text-[#CCAA49] font-black text-[10px] tracking-widest uppercase mb-12 hover:text-[#1A2634] transition-colors border border-[#CCAA49]/30 w-fit px-4 py-2 rounded-lg bg-[#CCAA49]/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Dashboard
                    </Link>
                    
                    <header className="mb-12">
                        <h2 className="text-4xl font-black text-[#1A2634] tracking-tighter uppercase italic">
                            Personnel Auth
                        </h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">
                            Enter credentials to initialize session
                        </p>
                    </header>

                    {/* Error Alert Box */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-left-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-[#CCAA49]">
                                Secure ID (Email)
                            </label>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                placeholder="ADMIN@SYSTEM.COM"
                                className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-bold text-[#1A2634] outline-none focus:bg-white focus:border-[#123765] focus:ring-4 focus:ring-[#123765]/10 shadow-sm transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-[#CCAA49]">
                                Access Key
                            </label>
                            <input 
                                type="password" 
                                required 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-bold text-[#1A2634] outline-none focus:bg-white focus:border-[#123765] focus:ring-4 focus:ring-[#123765]/10 shadow-sm transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full bg-[#1A2634] text-[#CCAA49] font-black py-5 rounded-xl uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-300 flex items-center justify-center border border-[#CCAA49]/20
                                ${isLoading 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-[#123765] hover:shadow-[#CCAA49]/10 hover:-translate-y-1 active:scale-95'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-[#CCAA49] border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Initialize Session'
                            )}
                        </button>
                    </form>

                    <footer className="mt-16 pt-8 border-t border-gray-50">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2 italic">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Auth Protocol Active
                            </p>
                            <span className="text-[9px] text-gray-200 font-mono">System v1</span>
                        </div>
                    </footer>
                </div>
            </motion.div>
        </div>
    );
}