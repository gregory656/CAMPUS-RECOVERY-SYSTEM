// src/KyuAiAssistant.jsx
import { useState } from "react";
import "./KyuAiAssistant.css";

const topics = ["Tech", "Med", "Business", "Education", "Fun"];

export default function KyuAiAssistant() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async (prompt) => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", content: prompt };
    setChat((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const aiMessage = { role: "assistant", content: data.response || "No response." };
      setChat((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [...prev, { role: "assistant", content: "❌ Error contacting AI." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="kyu-ai-container">
      <h2>Kyu Pulse AI Assistant</h2>
      <p>Ask anything or choose a topic below:</p>

      {/* Topic Buttons */}
      <div className="topics">
        {topics.map((t) => (
          <button key={t} onClick={() => sendPrompt(`Teach me about ${t}`)}>
            {t}
          </button>
        ))}
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        {chat.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <span>{msg.content}</span>
          </div>
        ))}
        {loading && <div className="chat-message assistant">⏳ AI is thinking...</div>}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}