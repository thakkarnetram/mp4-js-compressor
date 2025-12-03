import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";

export default function ImageUploadCard() {
    const [file, setFile] = useState(null);
    const [resultUrl, setResultUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [quality, setQuality] = useState(80);
    const [validationMsg, setValidationMsg] = useState("");

    const onDropAccepted = useCallback((acceptedFiles) => {
        setValidationMsg("");
        const f = acceptedFiles[0];
        setFile(f);
        setResultUrl("");
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
                msg = "Only PNG and JPG/JPEG images are allowed.";
            } else if (err.code === "file-too-large") {
                msg = "File too large.";
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
            accept: {
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
            },
            maxFiles: 1,
            multiple: false,
            maxSize: 20 * 1024 * 1024,
        });

    const handleCompress = async () => {
        if (!file) {
            setValidationMsg("Please choose a PNG or JPG image first.");
            return;
        }
        setLoading(true);
        setProgress(0);
        setValidationMsg("");

        const formData = new FormData();
        formData.append("image", file);
        formData.append("quality", quality);

        try {
            const res = await axios.post("http://192.168.1.43:8082/api/v1/compress/image", formData, {
                responseType: "blob",
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
                timeout: 0,
            });

            const url = URL.createObjectURL(new Blob([res.data]));
            setResultUrl(url);
        } catch (err) {
            console.error("Image compress error:", err);
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
                        🖼️ {file.name} <br />
                        <small>({(file.size / 1024).toFixed(2)} KB)</small>
                    </p>
                ) : isDragReject ? (
                    <p style={{ color: "#cbd5e1" }}>
                        Unsupported file — only PNG / JPG allowed.
                    </p>
                ) : (
                    <p>Drag & drop or click to upload a PNG / JPG image</p>
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
