import React from "react";
import Pricing from "../components/Pricing";
import UploadCard from "./UploadTabs";
import FAQ from "../components/FAQ";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-auto">
            <section id="upload" className="flex justify-center py-12">
                <UploadCard />
            </section>
            <section className="px-6 md:px-12 lg:px-32 py-10 space-y-8">
                <div className="bg-slate-800/60 border border-slate-700 p-8 rounded-2xl text-center space-y-3">
                    <h2 className="text-2xl font-bold">Welcome to TinyCompression 🚀</h2>
                    <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                        Compress your videos and images instantly. Fast, private, and secure —
                        your files are never stored. Just upload, compress, and download.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl space-y-3">
                        <h3 className="text-lg font-semibold">⚡ Fast Compression</h3>
                        <p className="text-slate-400 text-sm">
                            Get smaller MP4, PNG, and JPG files in seconds using optimized compression.
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl space-y-3">
                        <h3 className="text-lg font-semibold">🔒 Private & Secure</h3>
                        <p className="text-slate-400 text-sm">
                            Files are processed temporarily and deleted automatically. Nothing is stored.
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl space-y-3">
                        <h3 className="text-lg font-semibold">🛠 Custom Quality</h3>
                        <p className="text-slate-400 text-sm">
                            Choose CRF for videos or quality level for images to control the file size.
                        </p>
                    </div>

                </div>
            </section>
            <Pricing />
            <FAQ />
            <footer className="text-center text-slate-500 py-6 border-t border-slate-800">
                © {new Date().getFullYear()} TinyCompression. All rights reserved.
                <br />
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            </footer>
        </div>
    );
}
