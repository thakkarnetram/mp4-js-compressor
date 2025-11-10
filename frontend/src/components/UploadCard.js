import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";

export default function UploadCard() {
    const [file, setFile] = useState(null);
    const [compressedUrl, setCompressedUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles) => {
        setFile(acceptedFiles[0]);
        setCompressedUrl("");
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "video/mp4": [".mp4"] },
    });

    const handleCompress = async () => {
        if (!file) return;
        setLoading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("video", file);

        try {
            const res = await axios.post("http://localhost:4000/compress", formData, {
                responseType: "blob",
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setProgress(percent);
                },
            });

            const url = URL.createObjectURL(new Blob([res.data]));
            setCompressedUrl(url);
        } catch (err) {
            alert("Compression failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="upload-card"
            style={{
                background: "#1e293b",
                borderRadius: 16,
                padding: 30,
                textAlign: "center",
                marginTop: 30,
            }}
        >
            <div
                {...getRootProps()}
                style={{
                    border: "2px dashed #475569",
                    padding: 40,
                    borderRadius: 12,
                    cursor: "pointer",
                    background: isDragActive ? "#334155" : "transparent",
                }}
            >
                <input {...getInputProps()} />
                {file ? (
                    <p>
                        🎞️ {file.name} <br />
                        <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    </p>
                ) : (
                    <p>Drag & drop or click to upload an MP4</p>
                )}
            </div>

            {file && (
                <>
                    <div style={{ marginTop: 20 }}>
                        <button onClick={handleCompress} disabled={loading}>
                            {loading ? "Compressing..." : "Compress"}
                        </button>
                    </div>

                    {loading && (
                        <div style={{ marginTop: 10 }}>
                            <p>{progress}%</p>
                        </div>
                    )}

                    {compressedUrl && (
                        <div style={{ marginTop: 20 }}>
                            <a href={compressedUrl} download={`compressed-${file.name}`}>
                                <button>⬇️ Download Compressed File</button>
                            </a>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
