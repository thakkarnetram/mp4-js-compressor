import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { name: "Home", href: "#" },
        { name: "Pricing", href: "#pricing" },
    ];

    return (
        <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">

            <div className="text-2xl font-semibold tracking-tight text-blue-400">
                TinyMP4
            </div>

            <div className="hidden md:flex gap-8 text-sm font-medium">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        className="hover:text-blue-400 transition-colors duration-200"
                    >
                        {link.name}
                    </a>
                ))}
                <a
                    href="#upload"
                    className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
                >
                    Try Now
                </a>
            </div>

            <button
                className="md:hidden flex flex-col gap-1"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <span className="w-6 h-[2px] bg-white"></span>
                <span className="w-6 h-[2px] bg-white"></span>
                <span className="w-6 h-[2px] bg-white"></span>
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 left-0 w-full bg-slate-800 flex flex-col items-center md:hidden py-6 space-y-4 z-50"
                    >
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-lg hover:text-blue-400 transition"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="#upload"
                            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
                            onClick={() => setMenuOpen(false)}
                        >
                            Try Now
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
