import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";

export default function VideoUploadCard() {
    const [file, setFile] = useState(null);
    const [compressedUrl, setCompressedUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [crf, setCrf] = useState(24);
    const [validationMsg, setValidationMsg] = useState("");

    // const MAX_SIZE = 1024 * 1024 * 1024;

    const onDropAccepted = useCallback((acceptedFiles) => {
        setValidationMsg("");
        const f = acceptedFiles[0];
        setFile(f);
        setCompressedUrl("");
    }, []);

    const onDropRejected = useCallback((fileRejections) => {
        if (!fileRejections || fileRejections.length === 0) {
            setValidationMsg("File rejected.");
            return;
        }
        const first = fileRejections[0];
        let msg = "File not accepted.";
        if (first.errors && first.errors.length > 0) {
            const err = first.errors[0];
            if (err.code === "file-invalid-type") {
                msg = "Only MP4 videos are allowed.";
            } else {
                msg = err.message || "File not accepted.";
            }
        }
        setValidationMsg(msg);
    }, []);

    const { getRootProps, getInputProps, isDragActive, isDragReject } =
        useDropzone({
            onDropAccepted,
            onDropRejected,
            accept: { "video/mp4": [".mp4"] },
            maxFiles: 1,
            multiple: false,
            // maxSize: MAX_SIZE,
        });

    const handleCompress = async () => {
        if (!file) {
            setValidationMsg("Please choose an MP4 video first.");
            return;
        }
        setLoading(true);
        setProgress(0);
        setValidationMsg("");

        const formData = new FormData();
        formData.append("video", file);
        formData.append("crf", crf);

        try {
            const res = await axios.post("http://192.168.1.43:8082/api/v1/compress/video", formData, {
                responseType: "blob",
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setProgress(percent);
                },
                timeout: 0,
            });

            const url = URL.createObjectURL(new Blob([res.data]));
            setCompressedUrl(url);
        } catch (err) {
            console.error("Video compress error:", err);
            setValidationMsg("Compression failed. Check server logs.");
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
                        🎞️ {file.name} <br />
                        <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    </p>
                ) : isDragReject ? (
                    <p style={{ color: "#cbd5e1" }}>Unsupported file — only MP4 allowed.</p>
                ) : (
                    <p>Drag & drop or click to upload an MP4 video</p>
                )}
            </div>

            {validationMsg && (
                <div
                    style={{
                        marginTop: 12,
                        background: "#111827",
                        color: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #374151",
                    }}
                >
                    {validationMsg}
                </div>
            )}

            {file && (
                <>
                    <div style={{ marginTop: 18 }}>
                        <label htmlFor="crfRange">Quality (CRF): {crf}</label>
                        <input
                            id="crfRange"
                            type="range"
                            min="18"
                            max="30"
                            value={crf}
                            onChange={(e) => setCrf(Number(e.target.value))}
                            style={{ width: "100%", marginTop: 8 }}
                        />
                        <small className="text-slate-400">Lower CRF = better quality, larger file</small>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <button onClick={handleCompress} disabled={loading}>
                            {loading ? `Compressing ${progress}%` : "Compress Video"}
                        </button>
                    </div>

                    {compressedUrl && (
                        <div style={{ marginTop: 16 }}>
                            <a href={compressedUrl} download={`compressed-${file.name}`}>
                                <button>⬇️ Download Compressed Video</button>
                            </a>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
