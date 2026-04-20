import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import styles from "../styles/uploadMemo.module.css";

export default function UploadMemo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [pdfText, setPdfText] = useState("");
  

  const { user, token, getAuthHeaders, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setUploadStatus("Uploading and processing file...");
    setPdfText("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const authHeaders = getAuthHeaders();
      delete authHeaders["Content-Type"];

      const response = await fetch("/api/admin/upload-memory", {
        method: "POST",
        headers: { ...authHeaders },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("✅ File processed successfully!");
        setPdfText(data.text || "");
        setFile(null);
      } else {
        setUploadStatus(`❌ ${data.error || "Upload failed"}`);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus(`❌ Error uploading file: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(""), 8000);
    }
  }

  return (
    <>
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isAuthenticated={!!user && !!token}
        user={user}
        messages={[]}
        sessions={[]}
        onNewChat={() => router.push("/")}
        onSwitchSession={() => {}}
        onDeleteSession={() => {}}
        onLogout={handleLogout}
        currentPage="uploadMemo"
      />

      <div className={`${styles.container} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.header}>
          <h1>Upload Memory</h1>
          <p>Upload PDF and TXT files to expand the chatbot's knowledge base</p>
        </div>

        <div className={styles.uploadSection}>
          <div
            className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={styles.uploadContent}>
              <div className={styles.uploadIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3>Drop files here or click to browse</h3>
              <p>Supports PDF and TXT files</p>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleChange}
                className={styles.fileInput}
              />
            </div>
          </div>

          {file && (
            <div className={styles.fileList}>
              <h4>Selected File</h4>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          )}

          {uploadStatus && (
            <div
              className={`${styles.status} ${
                uploadStatus.includes("❌")
                  ? styles.error
                  : uploadStatus.includes("⚠️")
                  ? styles.warning
                  : styles.success
              }`}
            >
              {uploadStatus}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={styles.uploadButton}
          >
            {uploading ? "Processing..." : "Upload & Process File"}
          </button>

          {pdfText && (
            <div>
              <h4 >Extracted PDF Text</h4>
              <pre style={{ marginTop: "20px", color: "black" }}>{pdfText}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
