// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import AdminPanel from "./AdminPanel";

import { addDocument, fetchCollection, uploadImage, updateDocument } from "./firebase";

// Reusable Form Component
const FormComponent = ({ type, form, setForm, setImageFile, imagePreview, setImagePreview, handleSubmit, loading }) => {
  const handleImageChange = (file) => {
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="form-container">
      <h2>Post {type === "lost" ? "Lost" : "Found"} Item</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Name:
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>Description:
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label>Contact:
          <input type="text" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </label>
        {type === "lost" && (
          <label>Email:
            <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
        )}
        <label>Location:
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </label>
        <label>Date:
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label>Image:
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0])} />
        </label>
        {imagePreview && <img src={imagePreview} alt="preview" className="preview" />}
        <button type="submit" className="btn" disabled={loading}>{loading ? "Saving..." : `Submit ${type === "lost" ? "Lost" : "Found"} Item`}</button>
      </form>
    </div>
  );
};

export default function App() {
  // Top bar
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Views / UI
  const [activeView, setActiveView] = useState("Home");
  const [loading, setLoading] = useState(false);

  // Sidebar state for mobile hamburger
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Forms (lost)
  const emptyForm = { name: "", description: "", contact: "", email: "", location: "", date: "", status: "posted" };
  const [lostForm, setLostForm] = useState(emptyForm);
  const [lostImageFile, setLostImageFile] = useState(null);
  const [lostImagePreview, setLostImagePreview] = useState("");

  // Forms (found)
  const [foundForm, setFoundForm] = useState(emptyForm);
  const [foundImageFile, setFoundImageFile] = useState(null);
  const [foundImagePreview, setFoundImagePreview] = useState("");

  // Items from Firestore
  const [items, setItems] = useState([]);

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [onlyWithImage, setOnlyWithImage] = useState(false);

  // Clock & date
  useEffect(() => {
    setCurrentDate(new Date().toDateString());
    const interval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load items from Firestore on mount
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const data = await fetchCollection("lost_and_found_items");
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading items:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // Utility: safe time getter for sorting
  const getItemTime = (it) => {
    if (it.createdAt) return Number(it.createdAt);
    if (it.date) {
      const t = Date.parse(it.date);
      if (!Number.isNaN(t)) return t;
    }
    return 0;
  };

  // Submit lost item
  const handleLostSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const imageUrl = lostImageFile ? await uploadImage(lostImageFile) : null;

      const item = {
        type: "lost",
        name: lostForm.name,
        description: lostForm.description,
        contact: lostForm.contact,
        email: lostForm.email || null,
        location: lostForm.location,
        date: lostForm.date || new Date().toISOString().slice(0, 10),
        imageUrl: imageUrl || null,
        createdAt: Date.now(),
        status: "posted",
      };

      await addDocument("lost_and_found_items", item);

      const updated = await fetchCollection("lost_and_found_items");
      setItems(updated);

      setLostForm(emptyForm);
      setLostImageFile(null);
      setLostImagePreview("");
      alert("Lost item saved to Firebase ✅");
      setActiveView("Help Retrieve Lost & Found");
    } catch (err) {
      console.error("Error saving lost item:", err);
      alert("Error saving item. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Submit found item
  const handleFoundSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const imageUrl = foundImageFile ? await uploadImage(foundImageFile) : null;

      const item = {
        type: "found",
        name: foundForm.name,
        description: foundForm.description,
        contact: foundForm.contact,
        location: foundForm.location,
        date: foundForm.date || new Date().toISOString().slice(0, 10),
        imageUrl: imageUrl || null,
        createdAt: Date.now(),
        status: "posted",
      };

      const docId = await addDocument("lost_and_found_items", item);

      const updated = await fetchCollection("lost_and_found_items");
      setItems(updated);

      // Find potential matches
      const lostItems = updated.filter(it => it.type === "lost");
      const matches = lostItems.filter(lost => {
        const ln = lost.name.toLowerCase();
        const fn = item.name.toLowerCase();
        const ld = lost.description.toLowerCase();
        const fd = item.description.toLowerCase();
        return ln.includes(fn) || fn.includes(ln) || ld.includes(fd) || fd.includes(ld);
      });

      if (matches.length > 0) {
        for (const match of matches) {
          await updateDocument("lost_and_found_items", match.id, { status: "matched", matchedWith: docId });
        }
        const finalItems = await fetchCollection("lost_and_found_items");
        setItems(finalItems);
        alert(`Found item saved. Potential matches found for lost items: ${matches.map(m => m.name).join(', ')}`);
      } else {
        alert("Found item saved to Firebase ✅");
      }

      setFoundForm(emptyForm);
      setFoundImageFile(null);
      setFoundImagePreview("");
      setActiveView("Help Retrieve Lost & Found");
    } catch (err) {
      console.error("Error saving found item:", err);
      alert("Error saving item. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Combine & sort items
  const combinedItems = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => getItemTime(b) - getItemTime(a));
    return copy;
  }, [items]);

  // Apply filters/search
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return combinedItems.filter((it) => {
      if (filterType !== "all" && it.type !== filterType) return false;
      if (onlyWithImage && !it.imageUrl) return false;
      if (!q) return true;
      return (
        (it.name || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q) ||
        (it.contact || "").toLowerCase().includes(q)
      );
    });
  }, [combinedItems, searchQuery, filterType, onlyWithImage]);

  // Render content
  const renderContent = () => {
    switch (activeView) {
      case "Admin Panel":
        return <AdminPanel />;

      case "Home":
        return (
          <div className="welcome">
            <h2>Staff Portal for Lost and Found Management</h2>
            <p>Register found items, match with lost reports, manage retrievals.</p>
          </div>
        );

      case "Post Lost Item":
        return <FormComponent type="lost" form={lostForm} setForm={setLostForm} setImageFile={setLostImageFile} imagePreview={lostImagePreview} setImagePreview={setLostImagePreview} handleSubmit={handleLostSubmit} loading={loading} />;

      case "Post Found Item":
        return <FormComponent type="found" form={foundForm} setForm={setFoundForm} setImageFile={setFoundImageFile} imagePreview={foundImagePreview} setImagePreview={setFoundImagePreview} handleSubmit={handleFoundSubmit} loading={loading} />;

      case "Help Retrieve Lost & Found":
        return (
          <div>
            <h2>Search & Retrieve</h2>
            <div className="filters">
              <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
              <label>
                <input type="checkbox" checked={onlyWithImage} onChange={(e) => setOnlyWithImage(e.target.checked)} />
                With image
              </label>
            </div>
            {loading ? <p>Loading items...</p> :
              <div className="items-grid">
                {filteredItems.length === 0 ? <p>No matching items.</p> :
                  filteredItems.map((it) => (
                    <div key={it.id} className="item-card" onClick={() => { setSelectedItem(it); setShowModal(true); }}>
                      {it.imageUrl ? <img src={it.imageUrl} alt="thumb" className="item-img" /> : <div className="no-img">No image</div>}
                      <div>
                        <strong>{it.type}</strong> {it.status === "matched" && <span style={{color: 'orange', fontWeight: 'bold'}}>MATCHED</span>} - <small>{it.date}</small>
                        <p>{it.name}</p>
                        <p className="item-info">📍 <strong>Location:</strong> {it.location || "Not provided"}</p>
                        <p className="item-info">☎ <strong>Contact:</strong> {it.contact || "Not provided"}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            }
          </div>
        );

      default:
        return <div className="welcome"><h2>Page not found</h2></div>;
    }
  };

  return (
    <div className="app">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className={activeView === "Home" ? "active" : ""} onClick={() => setActiveView("Home")}>Home</button>
        <button className={activeView === "Post Lost Item" ? "active" : ""} onClick={() => setActiveView("Post Lost Item")}>Post Lost Item</button>
        <button className={activeView === "Post Found Item" ? "active" : ""} onClick={() => setActiveView("Post Found Item")}>Post Found Item</button>
        <button className={activeView === "Help Retrieve Lost & Found" ? "active" : ""} onClick={() => setActiveView("Help Retrieve Lost & Found")}>Help Retrieve Lost & Found</button>

        <button className={activeView === "Admin Panel" ? "active" : ""} onClick={() => setActiveView("Admin Panel")}>Admin Panel</button>
      </div>
      <div className="main">
        <div className="top-bar">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="time-info">
            <span>{currentDate}</span>
            <span>{currentTime}</span>
          </div>
        </div>
        <div className="content">
          {renderContent()}
        </div>
      </div>
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <h3>{selectedItem?.type} Item Details</h3>
            {selectedItem?.imageUrl && <img src={selectedItem.imageUrl} alt="item" className="modal-img" />}
            <p><strong>Name:</strong> {selectedItem?.name}</p>
            <p><strong>Description:</strong> {selectedItem?.description}</p>
            <p><strong>Contact:</strong> {selectedItem?.contact}</p>
            <p><strong>Location:</strong> {selectedItem?.location}</p>
            <p><strong>Date:</strong> {selectedItem?.date}</p>
          </div>
        </div>
      )}
    </div>
  );
}