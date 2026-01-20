// src/AdminPanel.jsx
import { useState, useEffect, useCallback } from "react";
import { fetchCollection, addDocument, db } from "./firebase";
import { doc, deleteDoc } from "firebase/firestore";
import "./AdminPanel.css";

function AdminPanel() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const ADMIN_PASSWORD = "480723646";

  const loadItems = useCallback(async () => {
    // Demo fallback data in case Firestore is empty
    const demoItems = [
      { id: 1, title: "Lost Wallet", description: "Black leather wallet", location: "Library" },
      { id: 2, title: "Found Keys", description: "Set of keys", location: "Cafeteria" },
    ];

    try {
      const data = await fetchCollection("lost_and_found_items");
      // If Firestore returns empty, use demo
      setItems(data.length ? data : demoItems);
    } catch (error) {
      console.error("Error loading items:", error);
      setItems(demoItems); // fallback
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadItems();
  }, [isAdmin, loadItems]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      alert("✅ Welcome Admin!");
    } else {
      alert("❌ Wrong password!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`⚠ Are you sure you want to delete item ${id}?`)) return;
    try {
      await deleteDoc(doc(db, "lost_and_found_items", id));
      alert(`🗑 Item ${id} deleted successfully!`);
      loadItems();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete item. Demo mode may be active.");
    }
  };

  const handleVerify = async (id) => {
    try {
      await addDocument("verified_items", {
        verifiedId: id,
        verifiedAt: new Date().toISOString(),
      });
      alert(`✅ Item ${id} marked as verified`);
      loadItems();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to verify item. Demo mode may be active.");
    }
  };

  const handleRetrieved = async (id) => {
    try {
      await addDocument("retrieved_items", {
        retrievedId: id,
        retrievedAt: new Date().toISOString(),
      });
      alert(`📦 Item ${id} marked as retrieved`);
      loadItems();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to mark as retrieved. Demo mode may be active.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  const filteredItems = items.filter((it) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      (it.name || "").toLowerCase().includes(q) ||
      (it.description || "").toLowerCase().includes(q) ||
      (it.location || "").toLowerCase().includes(q)
    );
  });

  const totalItems = items.length;
  const lostCount = items.filter(it => it.type === "lost").length;
  const foundCount = items.filter(it => it.type === "found").length;
  const matchedCount = items.filter(it => it.status === "matched").length;
  const unclaimedCount = foundCount - matchedCount;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <p>Welcome, Admin! Manage Lost & Found posts below.</p>
      <button onClick={loadItems}>🔄 Refresh</button>

      <div className="metrics">
        <div className="metric">
          <strong>Total Items:</strong> {totalItems}
        </div>
        <div className="metric">
          <strong>Lost Items:</strong> {lostCount}
        </div>
        <div className="metric">
          <strong>Found Items:</strong> {foundCount}
        </div>
        <div className="metric">
          <strong>Matched Items:</strong> {matchedCount}
        </div>
        <div className="metric">
          <strong>Unclaimed Items:</strong> {unclaimedCount}
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="items-list">
        {filteredItems.length === 0 ? (
          <p>No items match your search.</p>
        ) : (
          filteredItems.map((it) => (
            <div key={it.id || Math.random()} className="admin-item">
              <h4>{it.name || "No Title"}</h4>
              <p>{it.description || "No Description"}</p>
              <small>{it.location || "No Location"}</small>
              <div className="actions">
                <button onClick={() => handleVerify(it.id)}>✅ Verify</button>
                <button onClick={() => handleRetrieved(it.id)}>📦 Retrieved</button>
                <button onClick={() => handleDelete(it.id)}>🗑 Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;