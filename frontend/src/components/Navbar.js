import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const links = [
        { name: "Home", to: "/" },
        { name: "Pricing", to: "/pricing" },
        { name: "FAQ", to: "/faq" },
    ];

    return (
        <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-40">
            <div className="text-2xl font-semibold tracking-tight text-blue-400">TinyCompression</div>

            <div className="hidden md:flex gap-8 text-sm font-medium items-center">
                {links.map((l) => (
                    <NavLink key={l.to} to={l.to} className={({isActive}) => isActive ? "text-blue-400" : "hover:text-blue-400"}>
                        {l.name}
                    </NavLink>
                ))}

                {!user ? (
                    <button
                        onClick={() => navigate("/auth")}
                        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
                    >
                        Sign Up
                    </button>
                ) : (
                    <div className="relative">
                        <button onClick={() => setProfileOpen(s => !s)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
                                {user.email?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="text-sm">{user.email?.split("@")[0]}</div>
                        </button>

                        <AnimatePresence>
                            {profileOpen && (
                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                            className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                                    <button className="block px-4 py-2 text-sm w-full text-left hover:bg-slate-700" onClick={() => { navigate("/profile"); setProfileOpen(false); }}>
                                        Profile
                                    </button>
                                    {/*<button className="block px-4 py-2 text-sm w-full text-left hover:bg-slate-700" onClick={() => { navigate("/settings"); setProfileOpen(false); }}>*/}
                                    {/*    Settings*/}
                                    {/*</button>*/}
                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700" onClick={() => { logout(); navigate("/"); }}>
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Mobile */}
            <button className="md:hidden flex flex-col gap-1" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="w-6 h-[2px] bg-white"></span>
                <span className="w-6 h-[2px] bg-white"></span>
                <span className="w-6 h-[2px] bg-white"></span>
            </button>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="absolute top-16 left-0 w-full bg-slate-800 flex flex-col items-center md:hidden py-6 space-y-4 z-50">
                        {links.map(l => (
                            <NavLink key={l.to} to={l.to} className="text-lg hover:text-blue-400" onClick={() => setMenuOpen(false)}>{l.name}</NavLink>
                        ))}
                        {!user ? (
                            <button onClick={() => { navigate("/auth"); setMenuOpen(false); }} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition">Sign Up</button>
                        ) : (
                            <>
                                <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="text-lg hover:text-blue-400">Profile</button>
                                <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition">Logout</button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
