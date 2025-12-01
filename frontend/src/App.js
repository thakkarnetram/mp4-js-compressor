import React from "react";
import Navbar from "./components/Navbar";
import Pricing from "./components/Pricing";
import UploadCard from "./components/UploadTabs";

export default function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Navbar />
            <section id="home" className="text-center py-20">
                <h1 className="text-4xl font-bold mb-4">
                    Compress Videos Effortlessly 🎬
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Upload your videos, choose your quality, and get smaller files in seconds — offline, fast, and private.
                </p>
            </section>
            <section id="upload" className="flex justify-center py-12">
                <UploadCard />
            </section>
            <Pricing />
            <footer className="text-center text-slate-500 py-6 border-t border-slate-800">
                © {new Date().getFullYear()} TinyMP4. All rights reserved.
            </footer>
        </div>
    );
}
