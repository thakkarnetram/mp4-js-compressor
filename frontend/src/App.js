import React from "react";
import UploadCard from "./components/UploadCard";

export default function App() {
  return (
      <div style={{ width: "100%", maxWidth: 500, margin: "auto" }}>
        <h1 style={{ textAlign: "center", fontWeight: 600 }}>🎬 MP4 Compressor</h1>
        <p style={{ textAlign: "center", color: "#94a3b8" }}>
          Compress your videos with great quality — fast & private.
        </p>
        <UploadCard />
      </div>
  );
}
