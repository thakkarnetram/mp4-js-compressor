// src/components/UploadTabs.js
import React, { useState } from "react";
import VideoUploadCard from "../components/compression-cards/VideoUploadCard";
import ImageUploadCard from "../components/compression-cards/ImageUploadCard";

export default function UploadTabs() {
    const [tab, setTab] = useState("video");

    return (
        <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => setTab("video")}
                    className={`px-4 py-2 rounded-md ${
                        tab === "video" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                    }`}
                >
                    Video
                </button>
                <button
                    onClick={() => setTab("image")}
                    className={`px-4 py-2 rounded-md ${
                        tab === "image" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                    }`}
                >
                    Image
                </button>
            </div>

            <div style={{ marginTop: 24 }}>
                {tab === "video" ? <VideoUploadCard /> : <ImageUploadCard />}
            </div>
        </div>
    );
}
