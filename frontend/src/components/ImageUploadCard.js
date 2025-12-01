// src/components/ImageUploadCard.js
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";

export default function ImageUploadCard() {
    const [file, setFile] = useState(null);
    const [resultUrl, setResultUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [quality, setQuality] = useState(80); // 0-100

    const onDrop = useCallback((acceptedFiles) => {
        setFile(acceptedFiles[0]);
        setResultUrl("");
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpg", ".jpeg", ".png", ".webp", ".avif"],
        },
    });

    const handleCompress = async () => {
        if (!file) return;
        setLoading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("quality", quality);

        try {
            const res = await axios.post("http://localhost:8082/api/v1/compress/image", formData, {
                responseType: "blob",
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
            });

            const url = URL.createObjectURL(new Blob([res.data]));
            setResultUrl(url);
        } catch (err) {
            console.error("Image compress error:", err);
            alert("Image compression failed. Check server logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="upload-card"
            style={{
                background: "#1e293b",
                borderRadius: 16,
                padding: 30,
                textAlign: "center",
            }}
        >
            <div
                {...getRootProps()}
                style={{
                    border: "2px dashed #475569",
                    padding: 30,
                    borderRadius: 12,
                    cursor: "pointer",
                    background: isDragActive ? "#334155" : "transparent",
                }}
            >
                <input {...getInputProps()} />
                {file ? (
                    <p>
                        🖼️ {file.name} <br />
                        <small>({(file.size / 1024).toFixed(2)} KB)</small>
                    </p>
                ) : (
                    <p>Drag & drop or click to upload an image</p>
                )}
            </div>

            {file && (
                <>
                    <div style={{ marginTop: 18 }}>
                        <label htmlFor="qualityRange">Quality: {quality}%</label>
                        <input
                            id="qualityRange"
                            type="range"
                            min="30"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            style={{ width: "100%", marginTop: 8 }}
                        />
                        <small className="text-slate-400">Lower = smaller file</small>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <button onClick={handleCompress} disabled={loading}>
                            {loading ? `Compressing ${progress}%` : "Compress Image"}
                        </button>
                    </div>

                    {resultUrl && (
                        <div style={{ marginTop: 16 }}>
                            <img src={resultUrl} alt="result" style={{ maxWidth: "100%", borderRadius: 8 }} />
                            <div style={{ marginTop: 8 }}>
                                <a href={resultUrl} download={`compressed-${file.name}`}>
                                    <button>⬇️ Download Compressed Image</button>
                                </a>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
