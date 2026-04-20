import { useState } from "react";
import styles from "./Sidebar.module.css";
import DeleteModal from "./DeleteModal";
import Link from "next/link";

export default function Sidebar({
  messages,
  sessions,
  currentSessionId,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
  sidebarOpen,
  onToggleSidebar,
  user,
  onLogout,
  isAuthenticated,
  currentPage = "chat",
}) {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    sessionId: null,
    sessionTitle: "",
  });
  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        className={`${styles.sidebarToggle} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${!sidebarOpen ? styles.closed : ""}`}>
        <div className={styles.sidebarHeader}>
          <h1>Lumino</h1>
        </div>
        {/* Admin Menu - Show only for admin users */}
        {(user?.role === "admin" && (currentPage =="dashboard" || currentPage == "uploadMemo")) ? (
          
          <div className={styles.adminSection}>
            <Link 
                href="/" 
                className={`${styles.adminMenuItem} ${styles.returnToChat}`}
              >
                <svg className={styles.adminIcon} width="20" height="20" viewBox="0 0 24 24" fill="#d3cbfc">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Return to Chat
              </Link>
            <h3 className={styles.sectionTitle}>Admin Panel</h3>
            <div className={styles.adminMenu}>
              
              <Link 
                href="/dashboard" 
                className={`${styles.adminMenuItem} ${currentPage === "dashboard" ? styles.active : ""}`}
              >
                <svg className={styles.adminIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                Dashboard
              </Link>
              <Link 
                href="/uploadMemo" 
                className={`${styles.adminMenuItem} ${currentPage === "uploadMemo" ? styles.active : ""}`}
              >
                <svg className={styles.adminIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Upload Memory
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.sidebarSection}>
              <button className={styles.newChatButton} onClick={onNewChat}>
                <span>+</span>
                New Chat
              </button>
            </div>

            <div className={styles.chatSection}>
              <h3 className={styles.sectionTitle}>Chat History</h3>
              <div className={styles.chatHistory}>
                {isAuthenticated && sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`${styles.chatItem} ${
                        session.id === currentSessionId ? styles.activeChat : ""
                      }`}
                    >
                      <div
                        className={styles.chatItemMain}
                        onClick={() => onSwitchSession(session.id)}
                      >
                        <div className={styles.chatItemContent}>
                          <div className={styles.chatTitle}>{session.title}</div>
                          <div className={styles.chatMeta}>
                            {session.message_count} messages •{" "}
                            {new Date(session.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            isOpen: true,
                            sessionId: session.id,
                            sessionTitle: session.title,
                          });
                        }}
                        title="Delete chat"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#8187dc"
                        >
                          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : messages.length > 0 ? (
                  <div className={styles.chatItem}>
                    <span>💬</span>
                    <div className={styles.chatItemContent}>
                      <div className={styles.chatTitle}>Current Chat</div>
                      <div className={styles.chatMeta}>
                        {messages.length} messages
                        {!isAuthenticated && (
                          <span style={{ color: "#8e8ea0", marginLeft: "5px" }}>
                            (not saved)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No recent chats</div>
                )}
              </div>
            </div>
            {user?.role === "admin" && (
              <div className={styles.dashboardSection}>
                <Link href="/dashboard" className={styles.newChatButton}>
                <svg className={styles.adminIcon} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                <path d="M680-280q25 0 42.5-17.5T740-340q0-25-17.5-42.5T680-400q-25 0-42.5 17.5T620-340q0 25 17.5 42.5T680-280Zm0 120q31 0 57-14.5t42-38.5q-22-13-47-20t-52-7q-27 0-52 7t-47 20q16 24 42 38.5t57 14.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v227q-19-8-39-14.5t-41-9.5v-147l-240-90-240 90v188q0 47 12.5 94t35 89.5Q310-290 342-254t71 60q11 32 29 61t41 52q-1 0-1.5.5t-1.5.5Zm200 0q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM480-494Z"/>
                </svg>
                  Admin Panel
                </Link>
              </div>
            )}
          </>
          
        )}

        {isAuthenticated && user && (
          <>
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.username}>{user.username}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
              </div>
              <button className={styles.logoutButton} onClick={onLogout}>
                Logout
              </button>
            </div>
          </>
        )}

        {/* Guest Section - Only show if not authenticated */}
        {!isAuthenticated && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div
                className={styles.userAvatar}
                style={{ background: "#6c757d" }}
              >
                👤
              </div>
              <div className={styles.userDetails}>
                <span className={styles.username}>Guest User</span>
                <span className={styles.userEmail}>Not logged in</span>
              </div>
            </div>
            <button
              className={styles.logoutButton}
              style={{ background: "#5a189a" }}
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, sessionId: null, sessionTitle: "" })
        }
        onConfirm={() => {
          onDeleteSession(deleteModal.sessionId);
          setDeleteModal({ isOpen: false, sessionId: null, sessionTitle: "" });
        }}
        chatTitle={deleteModal.sessionTitle}
        onSettingsClick={() => {
          // TODO: Implement settings navigation
          console.log("Navigate to settings");
          setDeleteModal({ isOpen: false, sessionId: null, sessionTitle: "" });
        }}
      />
    </>
  );
}
