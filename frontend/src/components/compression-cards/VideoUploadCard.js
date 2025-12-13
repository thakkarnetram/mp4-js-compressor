import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function VideoUploadCard() {
  const { user, token } = useAuth();
  const isLoggedIn = !!user;
  const isPro = user?.plan === "pro";
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const [items, setItems] = useState([]);
  const [crf, setCrf] = useState(24);
  const [msg, setMsg] = useState("");
  const uploadingRef = useRef(false);
  const MAX_FILE_SIZE_ANON_MB = 25;
  const MAX_FILE_SIZE_STANDARD_MB = 100;
  const MAX_FILE_SIZE_PRO_MB = 250;
  const MB_TO_BYTES = 1024 * 1024;
  const maxFileSize = isPro
    ? MAX_FILE_SIZE_PRO_MB * MB_TO_BYTES
    : isLoggedIn
      ? MAX_FILE_SIZE_STANDARD_MB * MB_TO_BYTES
      : MAX_FILE_SIZE_ANON_MB * MB_TO_BYTES;

  const maxFileSizeMB = isPro
    ? MAX_FILE_SIZE_PRO_MB
    : isLoggedIn
      ? MAX_FILE_SIZE_STANDARD_MB
      : MAX_FILE_SIZE_ANON_MB;
  const activeIntervals = useRef({});

  // const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8082";
  const envServers = process.env.REACT_APP_API_URL;
  const API_SERVERS = envServers ? envServers.split(",").map(url => url.trim()) : ["http://localhost:8082"]

  const pickServer = () => {
    const randomIndex = Math.floor(Math.random() * API_SERVERS.length);
    return API_SERVERS[randomIndex];
  }

  useEffect(() => {
    const intervals = activeIntervals.current;
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  const wrapFiles = (files) =>
    Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      progress: 0,
      status: "idle",
      jobId: null,
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

  const onDropRejected = useCallback((fileRejections) => {
    const sizeRejected = fileRejections.some(r =>
      r.errors.some(e => e.code === 'file-too-large')
    );
    if (sizeRejected) {
      setMsg(`Some files were rejected. Max file size is ${maxFileSizeMB} MB for your plan.`);
    } else {
      setMsg("Some files were rejected — only MP4 allowed.");
    }
  }, [maxFileSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: { "video/mp4": [".mp4"] },
    multiple: true,
    maxFiles: 30,
    maxSize: maxFileSize
  });

  const removeItem = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (activeIntervals.current[id]) {
      clearInterval(activeIntervals.current[id]);
      delete activeIntervals.current[id];
    }
  };

  const pollStatus = (jobId, itemId, serverUrl, onSuccess, onError) => {
    const intervalId = setInterval(async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/compress/video/status/${jobId}`, {
          withCredentials: true,
          headers: authHeader,
        });

        const status = res.data.status;

        if (status === "done") {
          clearInterval(intervalId);
          delete activeIntervals.current[itemId || jobId];
          if (onSuccess) onSuccess();
        } else if (status === "error") {
          clearInterval(intervalId);
          delete activeIntervals.current[itemId || jobId];
          if (onError) onError(res.data.error);
        } else {
          if (itemId) {
            setItems((prev) => prev.map((x) => {
              if (x.id === itemId && x.progress < 90) {
                return { ...x, progress: x.progress + 2 };
              }
              return x;
            }));
          }
        }
      } catch (err) {
        clearInterval(intervalId);
        if (onError) onError(err.message);
      }
    }, 3000);

    activeIntervals.current[itemId || jobId] = intervalId;
  };

  const downloadFile = (id, filename) => {
    const it = items.find((x) => x.id === id);
    if (!it || !it.jobId || !it.serverUrl) return;

    const downloadUrl = `${it.serverUrl}/api/v1/compress/video/download/${it.jobId}`;

    const a = document.createElement("a");
    a.href = downloadUrl;
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
    const assignedServer = pickServer();
    setItems((prev) =>
      prev.map((x) => (x.id === it.id ? { ...x, status: "uploading", progress: 0, serverUrl: assignedServer } : x))
    );

    const fd = new FormData();
    fd.append("video", it.file);
    fd.append("crf", String(crf));

    try {
      const res = await axios.post(`${assignedServer}/api/v1/compress/video/job`, fd, {
        withCredentials: true,
        headers: { ...authHeader },
        onUploadProgress: (e) => {
          if (!e.lengthComputable) return;

          const pct = Math.round((e.loaded * 50) / e.total);
          setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, progress: pct } : x)));
        },
      });

      const { jobId } = res.data;

      setItems((prev) =>
        prev.map((x) => (x.id === it.id ? { ...x, jobId, progress: 50 } : x)) // 50% = Uploaded, Waiting for compress
      );

      return new Promise((resolve) => {
        pollStatus(
          jobId,
          it.id,
          assignedServer,
          () => {
            setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100 } : x)));
            resolve({ ok: true });
          },
          (err) => {
            setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "error" } : x)));
            resolve({ ok: false, message: err });
          }
        );
      });

    } catch (err) {
      if (err.response && err.response.status === 403) {
        const parsed = await parseErrorBody(err.response.data);
        if (parsed?.code === "ANON_LIMIT_EXCEEDED" || parsed?.code === "QUOTA_EXCEEDED") {
          setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "blocked" } : x)));
          return { ok: false, code: "ANON_LIMIT_EXCEEDED", message: parsed.message };
        }
      }
      setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "error" } : x)));
      return { ok: false, code: "ERROR" };
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
      const cur = items[i];
      if (cur.status === "done" || cur.status === "blocked" || cur.status === "uploading") continue;

      const result = await uploadOne(cur);

      if (!result?.ok && result?.code === "ANON_LIMIT_EXCEEDED") {
        stoppedDueToLimit = true;
        setMsg(result.message || "Limit reached.");
        break;
      }
    }
    uploadingRef.current = false;
    if (!stoppedDueToLimit) {
      setMsg("All uploads processed.");
    }
  };

  const uploadAllAndGetZip = async () => {
    if (uploadingRef.current) return;
    if (items.length === 0) {
      setMsg("Add files first.");
      return;
    }
    if (!(isLoggedIn && isPro)) {
      setMsg("Batch ZIP is for Pro users only.");
      return;
    }

    uploadingRef.current = true;
    setMsg("Uploading batch...");
    const assignedServer = pickServer();
    setItems((prev) => prev.map((it) => ({ ...it, status: "uploading", progress: 0 })));

    const fd = new FormData();
    items.forEach((it) => fd.append("video", it.file));
    fd.append("crf", String(crf));

    try {
      const res = await axios.post(`${assignedServer}/api/v1/compress/video/job`, fd, {
        withCredentials: true,
        headers: { ...authHeader },
        onUploadProgress: (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded * 50) / e.total);
          setItems((prev) => prev.map((it) => ({ ...it, progress: pct })));
        },
      });

      const { jobId } = res.data;
      setMsg("Compressing batch on server... Please wait.");

      setItems((prev) => prev.map((it) => ({ ...it, progress: 50 })));

      pollStatus(
        jobId,
        null,
        assignedServer,
        () => {

          uploadingRef.current = false;
          setItems((prev) => prev.map((it) => ({ ...it, status: "done", progress: 100 })));
          setMsg("Batch Done! Downloading ZIP...");
          const downloadUrl = `${assignedServer}/api/v1/compress/video/download/${jobId}`;
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `compressed-batch-${Date.now()}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
        (err) => {
          uploadingRef.current = false;
          setMsg("Batch compression failed.");
          setItems((prev) => prev.map((it) => ({ ...it, status: "error" })));
        }
      );

    } catch (err) {
      console.error("Batch error", err);
      uploadingRef.current = false;
      if (err.response && err.response.status === 403) {
        const parsed = await parseErrorBody(err.response.data);
        const code = parsed?.code;
        if (code === "LIMIT_EXCEEDED" || code === "QUOTA_EXCEEDED" || code === "FILE_TOO_LARGE") {
          setMsg(parsed.message || "Upload limit exceeded.");
          setItems((prev) => prev.map((it) => ({ ...it, status: "blocked" })));
          return;
        }
      }
      setMsg("Batch upload failed.");
      setItems((prev) => prev.map((it) => ({ ...it, status: "error" })));
    }
  };

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
          or click to browse
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
                        {it.status === "uploading" && `Processing ${it.progress}%`}
                        {it.status === "done" && "Done"}
                        {it.status === "error" && "Error"}
                        {it.status === "blocked" && <span style={{ color: "#ffb86b" }}>Limit reached</span>}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {it.status === "done" && (
                          <button
                            onClick={() => downloadFile(it.id, it.file.name)}
                            style={{ fontSize: 12, background: "#05203a", color: "#fff", padding: "6px 8px", borderRadius: 8 }}
                          >
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => removeItem(it.id)}
                          style={{ fontSize: 12, background: "#071826", color: "#fff", padding: "6px 8px", borderRadius: 8 }}
                        >
                          Remove
                        </button>
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
          Quality (CRF): <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{crf}</span>
        </label>

        {isPro ? (
          <input type="range" min="18" max="30" value={crf} onChange={(e) => setCrf(Number(e.target.value))} style={{ width: "100%" }} />
        ) : (
          <div style={{ display: "flex", gap: 8, justifyContent: 'center' }}>
            {FreeChoices.map((v) => (
              <button key={v} onClick={() => setCrf(v)} style={{ padding: "8px 12px", borderRadius: 8, background: v === crf ? "#2563eb" : "#071826", color: v === crf ? "#fff" : "#9fb0c8" }}>{v}</button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button
            onClick={startSequentialUploads}
            disabled={uploadingRef.current}
            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 700 }}
          >
            {uploadingRef.current ? "Processing..." : "Sequential Upload"}
          </button>

          {isLoggedIn && isPro && (
            <button
              onClick={uploadAllAndGetZip}
              disabled={uploadingRef.current}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "#0b1622", color: "#cde7ff", border: "1px solid #173246", fontWeight: 700 }}
            >
              Batch ZIP
            </button>
          )}
        </div>

        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => { setItems([]); setMsg(""); }} style={{ padding: "8px 12px", borderRadius: 10, background: "#091324", color: "#9fb0c8", border: "1px solid #173246" }}>Clear</button>
        </div>
      </div>
    </motion.div>
  );
}