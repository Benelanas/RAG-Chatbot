import { useState, useEffect } from "react";
import styles from "./userTable.module.css";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [editPopup, setEditPopup] = useState({
    open: false,
    user: null,
    role: "",
  });
  const [deletePopup, setDeletePopup] = useState({ open: false, user: null });
  const [selectedRole, setSelectedRole] = useState("All");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Error loading users:", err);
      }
    }
    fetchUsers();
  }, []);

  // Handler for edit popup open
  function handleEditClick(user) {
    setEditPopup({ open: true, user, role: user.role });
  };

  // Handler for delete popup open
  function handleDeleteClick(user) {
    setDeletePopup({ open: true, user });
  };

  // Handler for role change
  function handleRoleChange(e) {
    setEditPopup((prev) => ({ ...prev, role: e.target.value }));
  };

  // Handler for saving role
  async function handleSaveRole() {
    if (!editPopup.user) return;
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editPopup.user.id_user,
          role: editPopup.role,
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id_user === editPopup.user.id_user
              ? { ...u, role: editPopup.role }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
    setEditPopup({ open: false, user: null, role: "" });
  };

  // Handler for cancel edit
  function handleCancelEdit() {
    setEditPopup({ open: false, user: null, role: "" });
  };

  // Handler for confirming delete
  async function handleConfirmDelete() {
    if (!deletePopup.user) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletePopup.user.id_user }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.filter((u) => u.id_user !== deletePopup.user.id_user)
        );
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
    setDeletePopup({ open: false, user: null });
  };

  // Handler for cancel delete
  function handleCancelDelete() {
    setDeletePopup({ open: false, user: null });
  };

  // Generate avatar color based on username
  function getAvatarColor(username) {
    const colors = ['#ef4444', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get user initials
  function getUserInitials(username) {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className={styles.userTableContainer}>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          
        </div>
      </div>

      {/* User Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.userTable}>
          <thead>
            <tr>

              <th>
                <span className={styles.headerIcon}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg></span>
                Full name
              </th>
              <th>
                <span className={styles.headerIcon}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v58q0 59-40.5 100.5T740-280q-35 0-66-15t-52-43q-29 29-65.5 43.5T480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480v58q0 26 17 44t43 18q26 0 43-18t17-44v-58q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93h200v80H480Zm0-280q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z"/></svg></span>
                Email
              </th>
              <th>
                <span className={styles.headerIcon}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg></span>
                Role
              </th>
              
              <th>
                <span className={styles.headerIcon}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg></span>
                Joined date
              </th>
              
              <th>
                <span className={styles.headerIcon}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg></span>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id_user || user.id}>

                <td className={styles.userCell}>
                  <div className={styles.userAvatar} style={{ backgroundColor: getAvatarColor(user.username) }}>
                    {getUserInitials(user.username)}
                  </div>
                  <span className={styles.userName}>{user.username}</span>
                </td>
                <td className={styles.email}>{user.email}</td>
                                 <td className={styles.role}>{user.role}</td>
                 <td className={styles.joinedDate}>
                  {new Date().toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </td>
                
                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditClick(user)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg> Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteClick(user)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Role Popup */}
      {editPopup.open && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>Edit Role for {editPopup.user.username}</h3>
            <select
              value={editPopup.role}
              onChange={handleRoleChange}
              className={styles.selectRole}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className={styles.popupActions}>
              <button className={styles.actionBtn} onClick={handleSaveRole}>
                Save
              </button>
              <button className={styles.actionBtn} onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deletePopup.open && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete user <strong>{deletePopup.user.username}</strong>? This action cannot be undone.</p>
            <div className={styles.popupActions}>
              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={handleConfirmDelete}>
                Delete
              </button>
              <button className={styles.actionBtn} onClick={handleCancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
