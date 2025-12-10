import React from "react";
import Pricing from "../components/Pricing";
import UploadCard from "./UploadTabs";
import FAQ from "../components/FAQ";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <section className="px-6 md:px-24 lg:px-40 py-12 text-center text-slate-300 space-y-8">

                <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-white">What is TinyCompression?</h2>
                    <p>
                        TinyCompression helps you shrink MP4 videos, PNGs, and JPG images quickly while keeping
                        great quality. Everything is processed securely and never stored.
                    </p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white">How It Works</h3>
                    <p>Upload → pick quality → compress → download. Simple, fast, private.</p>
                    <ul className="text-left max-w-xl mx-auto list-disc list-inside space-y-1">
                        <li>Supports MP4, PNG, JPG formats</li>
                        <li>Choose your quality level</li>
                        <li>Fast compression powered by FFmpeg</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white">Why Compress Files?</h3>
                    <p>
                        Smaller files upload faster, take less storage, and are easier to share on WhatsApp,
                        Instagram, YouTube, and email.
                    </p>
                </div>
            </section>
            <section id="upload" className="flex justify-center py-12">
                <UploadCard />
            </section>
            <Pricing />
            <FAQ />
            <footer className="text-center text-slate-500 py-6 border-t border-slate-800">
                © {new Date().getFullYear()} TinyCompression. All rights reserved.
            </footer>
        </div>
    );
}
