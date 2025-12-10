import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function VideoUploadCard() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isPro = user?.plan === "pro";

  const [items, setItems] = useState([]);
  const [crf, setCrf] = useState(24);
  const [msg, setMsg] = useState("");
  const uploadingRef = useRef(false);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8082";

  const wrapFiles = (files) =>
    Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      progress: 0,
      status: "idle",
      url: null,
      controller: null,
    }));

  const onDropAccepted = useCallback((accepted) => {
    setMsg("");
    const mp4s = accepted.filter(
      (f) => f.type === "video/mp4" || f.name.toLowerCase().endsWith(".mp4")
    );
    if (mp4s.length === 0) {
      setMsg("Only MP4 files allowed.");
      return;
    }
    setItems((p) => [...p, ...wrapFiles(mp4s)]);
  }, []);

  const onDropRejected = useCallback(() => {
    setMsg("Some files were rejected — only MP4 allowed.");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: { "video/mp4": [".mp4"] },
    multiple: true,
    maxFiles: 30,
  });

  const removeItem = (id) => {
    setItems((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.id === id);
      if (idx >= 0) {
        const it = copy[idx];
        if (it.controller) {
          try {
            it.controller.abort();
          } catch { }
        }

        if (it.url) {
          try {
            URL.revokeObjectURL(it.url);
          } catch { }
        }
        copy.splice(idx, 1);
      }
      return copy;
    });
  };

  const cancelUpload = (id) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id && it.controller) {
          try {
            it.controller.abort();
          } catch { }
          return { ...it, status: "cancelled", controller: null };
        }
        return it;
      })
    );
  };

  const downloadFile = (id, filename) => {
    const it = items.find((x) => x.id === id);
    if (!it || !it.url) return;
    const a = document.createElement("a");
    a.href = it.url;
    a.download = `compressed-${filename}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  async function parseErrorBody(data) {
    try {
      if (data && typeof data.text === "function") {
        const txt = await data.text();
        return JSON.parse(txt);
      }
      if (typeof data === "object") return data;
      if (typeof data === "string") return JSON.parse(data);
    } catch (e) {
      return null;
    }
    return null;
  }

  const uploadOne = async (it) => {
    const controller = new AbortController();

    setItems((prev) =>
      prev.map((x) => (x.id === it.id ? { ...x, controller, status: "uploading", progress: 0 } : x))
    );

    const fd = new FormData();
    fd.append("video", it.file);
    fd.append("crf", String(crf));

    try {
      const res = await axios.post(`${API_BASE}/api/v1/compress/video`, fd, {
        responseType: "blob",
        signal: controller.signal,
        withCredentials: true,
        onUploadProgress: (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded * 100) / e.total);
          setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, progress: pct } : x)));
        },
        timeout: 0,
      });

      const blob = res.data;
      const url = URL.createObjectURL(blob);
      setItems((prev) =>
        prev.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100, url, controller: null } : x))
      );
      return { ok: true };
    } catch (err) {
      if (err.response && err.response.status === 403) {
        const parsed = await parseErrorBody(err.response.data);
        if (parsed?.code === "ANON_LIMIT_EXCEEDED") {
          setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "blocked", controller: null } : x)));
          return { ok: false, code: "ANON_LIMIT_EXCEEDED", message: parsed.message || "Anonymous daily limit reached." };
        }
      }
      if (axios.isCancel(err) || err?.name === "CanceledError") {
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "cancelled", controller: null } : x)));
        return { ok: false, code: "CANCELLED" };
      } else {
        console.error("upload error", err);
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "error", controller: null } : x)));
        return { ok: false, code: "ERROR", message: "Upload failed" };
      }
    }
  };

  const startSequentialUploads = async () => {
    if (uploadingRef.current) return;
    if (items.length === 0) {
      setMsg("Add some MP4 files first.");
      return;
    }
    uploadingRef.current = true;
    setMsg("");

    let stoppedDueToLimit = false;

    for (let i = 0; i < items.length; i++) {
      const id = items[i].id;

      const cur = items.find((x) => x.id === id);
      if (!cur) continue;
      if (cur.status === "done" || cur.status === "blocked") continue;
      if (cur.status === "uploading") continue;

      const result = await uploadOne(cur);
      if (!result?.ok && result?.code === "ANON_LIMIT_EXCEEDED") {
        stoppedDueToLimit = true;
        setMsg(result.message || "Anonymous daily limit reached. Please sign up to continue.");
        break;
      }
    }
    uploadingRef.current = false;
    if (!stoppedDueToLimit) {
      setMsg("Sequential uploads finished. Download each compressed file when ready.");
    }
  };

  const uploadAllAndGetZip = async () => {
    if (uploadingRef.current) return;
    if (items.length === 0) {
      setMsg("Add some MP4 files first.");
      return;
    }

    if (!(isLoggedIn && isPro)) {
      setMsg("Batch ZIP export is available for Pro users only. Sign up or upgrade to Pro to use this feature.");
      return;
    }

    uploadingRef.current = true;
    setMsg("Uploading all files & compressing into ZIP...");

    setItems((prev) => prev.map((it) => ({ ...it, status: "uploading", progress: 0 })));

    const fd = new FormData();
    items.forEach((it) => fd.append("video", it.file));
    fd.append("crf", String(crf));

    try {
      const res = await axios.post(`${API_BASE}/api/v1/compress/video`, fd, {
        responseType: "blob",
        timeout: 0,
        withCredentials: true,
        onUploadProgress: (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded * 100) / e.total);
          setItems((prev) => prev.map((it) => ({ ...it, progress: pct })));
        },
      });

      const contentType = (res.headers && (res.headers["content-type"] || "")) || "";
      const blob = res.data;
      const blobUrl = URL.createObjectURL(blob);

      if (contentType.includes("zip") || blobUrl) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `compressed-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setItems((prev) => prev.map((it) => ({ ...it, status: "done", progress: 100, url: null })));
        setMsg("ZIP downloaded. Done.");
      } else {
        setMsg("Server returned non-zip response. Check server logs.");
        setItems((prev) => prev.map((it) => ({ ...it, status: "error" })));
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        const parsed = await parseErrorBody(err.response.data);
        if (parsed?.code === "ANON_LIMIT_EXCEEDED") {
          setItems((prev) => prev.map((it) => ({ ...it, status: "blocked" })));
          setMsg(parsed.message || "Anonymous daily limit reached. Please sign up.");
          return;
        }
      }
      console.error("uploadAll error", err);
      setMsg("Upload or compression failed. Check server logs.");
      setItems((prev) => prev.map((it) => ({ ...it, status: "error", controller: null })));
    } finally {
      uploadingRef.current = false;
    }
  };

  // --- small UI helper for free/anon CRF choices ---
  const FreeChoices = [18, 25, 30];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="upload-card"
      style={{
        background: "#0b1220",
        borderRadius: 16,
        padding: 22,
        textAlign: "center",
        color: "#e6eef8",
      }}
    >
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #253546",
          padding: 22,
          borderRadius: 12,
          cursor: "pointer",
          background: isDragActive ? "#0f1724" : "transparent",
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontWeight: 700 }}>Drag & drop MP4s here</div>
        <div style={{ fontSize: 13, color: "#9fb0c8", marginTop: 6 }}>
          or click to browse — per-file progress is shown below.
        </div>
      </div>

      {msg && (
        <div
          style={{
            marginTop: 12,
            background: "#071026",
            color: "#cde7ff",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #173246",
          }}
        >
          {msg}
        </div>
      )}

      {items.length > 0 && (
        <div style={{ marginTop: 14, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Selected files</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{items.length} file(s)</div>
          </div>

          <div style={{ maxHeight: 260, overflowY: "auto", gap: 8 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600 }}>{it.file.name}</div>
                    <div style={{ fontSize: 12, color: "#9fb0c8" }}>{(it.file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 8, background: "#061222", borderRadius: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${it.progress}%`,
                          height: "100%",
                          background: it.status === "error" ? "#ff6b6b" : "#2563eb",
                          transition: "width 0.2s",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <div style={{ fontSize: 12, color: "#9fb0c8" }}>
                        {it.status === "idle" && "Ready"}
                        {it.status === "uploading" && `Uploading ${it.progress}%`}
                        {it.status === "done" && "Done"}
                        {it.status === "error" && "Error"}
                        {it.status === "cancelled" && "Cancelled"}
                        {it.status === "blocked" && (
                          <span style={{ color: "#ffb86b", fontWeight: 600 }}>
                            Limit reached — sign up to continue
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {it.status === "uploading" && (
                          <button
                            onClick={() => cancelUpload(it.id)}
                            style={{ fontSize: 12, background: "#1f2937", color: "#fff", padding: "6px 8px", borderRadius: 8 }}
                          >
                            Cancel
                          </button>
                        )}

                        {it.status === "done" && (
                          <button
                            onClick={() => downloadFile(it.id, it.file.name)}
                            style={{ fontSize: 12, background: "#05203a", color: "#fff", padding: "6px 8px", borderRadius: 8 }}
                          >
                            Download
                          </button>
                        )}

                        {(it.status === "idle" || it.status === "error" || it.status === "cancelled") && (
                          <button
                            onClick={() => removeItem(it.id)}
                            style={{ fontSize: 12, background: "#071826", color: "#fff", padding: "6px 8px", borderRadius: 8 }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
          Quality (CRF):{" "}
          <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{crf}</span>
        </label>

        {/* Pro users: full slider */}
        {isPro ? (
          <>
            <input
              type="range"
              min="18"
              max="30"
              value={crf}
              onChange={(e) => setCrf(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, color: "#9fb0c8", fontSize: 12 }}>
              <div>Better quality</div>
              <div>Smaller size</div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: 'center' }}>
            {FreeChoices.map((v) => {
              const active = v === crf;
              return (
                <button
                  key={v}
                  onClick={() => setCrf(v)}
                  aria-pressed={active}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: active ? "#2563eb" : "#071826",
                    color: active ? "#fff" : "#9fb0c8",
                    border: active ? "1px solid #1746c8" : "1px solid #173246",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              );
            })}

          </div>
        )}

        <small className="text-slate-100" style={{ display: "block", marginTop: 8 }}>
          Lower CRF = better quality, larger file.
          <div style={{ marginLeft: 12, color: "#b2b4b7ff", fontSize: 13 }}>
            {isLoggedIn ? "Free plan — limited CRF choices" : "Anonymous — limited CRF choices"}
          </div>
        </small>

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button
            onClick={startSequentialUploads}
            disabled={uploadingRef.current}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
            }}
            title="Uploads files one-by-one and lets you download each individually"
          >
            {uploadingRef.current ? "Uploading..." : "Upload Sequentially (one-by-one)"}
          </button>

          {(isLoggedIn && isPro) && (
            <button
              onClick={uploadAllAndGetZip}
              disabled={uploadingRef.current}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#0b1622",
                color: "#cde7ff",
                border: "1px solid #173246",
                fontWeight: 700,
              }}
              title="Upload all files in one request and get a single ZIP back"
            >
              {uploadingRef.current ? "Uploading & Preparing ZIP..." : "Upload & Download ZIP"}
            </button>
          )}
        </div>

        {!(isLoggedIn && isPro) && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#cbd5e1" }}>
            {isLoggedIn ? "ZIP export is available for Pro users only." : "Sign up for Pro to enable batch ZIP export."}
          </div>
        )}

        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={() => {
              items.forEach((f) => {
                if (f.controller) {
                  try {
                    f.controller.abort();
                  } catch { }
                }
                if (f.url) {
                  try {
                    URL.revokeObjectURL(f.url);
                  } catch { }
                }
              });
              setItems([]);
              setMsg("");
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "#091324",
              color: "#9fb0c8",
              border: "1px solid #173246",
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </motion.div>
  );
}
