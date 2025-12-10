import React from "react";
import Pricing from "../components/Pricing";
import UploadCard from "./UploadTabs";
import FAQ from "../components/FAQ";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <section className="px-6 md:px-24 lg:px-40 py-10 text-center text-slate-300">
                <h2 className="text-2xl font-semibold mb-4 text-white">
                    What Does TinyCompression Do?
                </h2>
                <p className="mb-4">
                    TinyCompression is a fast, secure, privacy-friendly file compressor that helps you
                    reduce the size of MP4 videos, PNGs, and JPG images instantly. Whether you're
                    sharing videos on social media, uploading to email, or saving device storage —
                    our tool keeps quality high while keeping file sizes low.
                </p>
                <p className="mb-4">
                    We use advanced FFmpeg optimization under the hood. This ensures your files are
                    compressed efficiently without noticeable quality loss. You stay in control with
                    adjustable quality settings (CRF for videos, quality percentage for images).
                </p>
                <p className="mb-4">
                    Your files are processed securely and deleted automatically. Nothing is stored on our
                    servers — your privacy is always protected.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-3 text-white">
                    How to Use the Compressor
                </h3>
                <ul className="text-left max-w-2xl mx-auto list-disc list-inside space-y-2">
                    <li>Upload your video or image file (MP4, PNG, JPG supported).</li>
                    <li>Choose the compression quality you prefer.</li>
                    <li>Wait for processing — usually only a few seconds.</li>
                    <li>Download your optimized file instantly.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-3 text-white">
                    Why Use File Compression?
                </h3>
                <p className="mb-4">
                    Compressed files load faster, upload quicker, and take less storage space. This is
                    especially useful for WhatsApp sharing, YouTube uploads, Instagram Reels, websites,
                    and email attachments that have strict size limits.
                </p>
                <p>
                    TinyCompression makes this process simple, fast, and accessible to everyone — no
                    software installation needed.
                </p>
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
