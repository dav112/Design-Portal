import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import db from "./src/db.ts";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // --- API Routes ---

  // Submit Request
  app.post("/api/requests", async (req, res) => {
    console.log("Received request:", req.body);
    const { 
      name, role, type, description, deadline,
      media, file_format, print_media_type, size, finishing,
      isUrgent
    } = req.body;

    // Validation
    if (!name || !role || !type || !description || !deadline) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (description.length < 20) {
      return res.status(400).json({ error: "Description must be at least 20 characters" });
    }
    
    const deadlineDate = new Date(deadline);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (deadlineDate < tomorrow && !isUrgent) {
      return res.status(400).json({ error: "Deadline must be at least tomorrow" });
    }

    try {
      // Save to DB
      const stmt = db.prepare(
        `INSERT INTO requests (
          name, role, type, description, deadline, 
          media, file_format, print_media_type, size, finishing,
          is_urgent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        name, role, type, description, deadline,
        media || null, file_format || null, print_media_type || null, size || null, finishing || null,
        isUrgent ? 1 : 0
      );

      // Get Telegram Settings
      const tokenRow = db.prepare("SELECT value FROM settings WHERE key = ?").get("telegram_bot_token") as { value: string };
      const chatIdRow = db.prepare("SELECT value FROM settings WHERE key = ?").get("telegram_chat_id") as { value: string };

      console.log("Telegram Settings - Token:", tokenRow?.value ? "Present" : "Missing", "Chat ID:", chatIdRow?.value || "Missing");

      let telegramStatus = "Not configured";

      if (tokenRow?.value && chatIdRow?.value) {
        let extraInfo = "";
        if (type === 'Online') {
          extraInfo = `📱 *Media:* ${media}\n📄 *Format:* ${file_format}`;
        } else {
          extraInfo = `🖨️ *Jenis Media:* ${print_media_type}\n📏 *Ukuran:* ${size}\n✨ *Finishing:* ${finishing}`;
        }

        const urgentHeader = isUrgent 
          ? "🚨 *URGENT DESIGN REQUEST* 🚨\n⚠️ *PRIORITY: HIGH*" 
          : "🚀 *NEW DESIGN REQUEST*";

        const message = `
${urgentHeader}
━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
💼 *Role:* ${role}
🎨 *Type:* ${type}
${extraInfo}
📅 *Deadline:* ${deadline} ${isUrgent ? "‼️" : ""}
📝 *Description:*
${description}
━━━━━━━━━━━━━━━━━━━━
⏰ *Timestamp:* ${new Date().toLocaleString()}
        `;

        const telegramUrl = `https://api.telegram.org/bot${tokenRow.value}/sendMessage`;
        try {
          const response = await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatIdRow.value,
              text: message,
              parse_mode: "Markdown",
            }),
          });

          if (response.ok) {
            telegramStatus = "Sent";
          } else {
            const errorData = await response.json();
            console.error("Telegram API Error:", errorData);
            telegramStatus = `Telegram Error: ${errorData.description || 'Unknown error'}`;
          }
        } catch (err) {
          console.error("Fetch Error:", err);
          telegramStatus = "Failed to connect to Telegram API";
        }
      } else {
        telegramStatus = "Telegram not configured (Chat ID missing)";
      }

      res.json({ success: true, telegramStatus });
    } catch (error) {
      console.error("Error saving request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Portfolio Endpoints ---

  app.get("/api/portfolio", (req, res) => {
    try {
      const items = db.prepare("SELECT * FROM portfolio ORDER BY created_at DESC").all();
      console.log(`Fetched ${items.length} portfolio items`);
      res.json(items);
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const admin = db.prepare("SELECT * FROM admins WHERE username = ? AND password = ?").get(username, password);
    
    if (admin) {
      res.cookie("admin_token", "secret_token_123", { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/admin/check", (req, res) => {
    if (req.cookies.admin_token === "secret_token_123") {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true });
  });

  app.post("/api/portfolio", (req, res) => {
    if (req.cookies.admin_token !== "secret_token_123") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, image_url, category } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ error: "Title and Image URL are required" });
    }

    try {
      db.prepare("INSERT INTO portfolio (title, image_url, category) VALUES (?, ?, ?)").run(title.trim(), image_url.trim(), category ? category.trim() : null);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add portfolio item" });
    }
  });

  app.delete("/api/portfolio/:id", (req, res) => {
    const adminToken = req.cookies.admin_token;
    const idStr = req.params.id;
    console.log(`DELETE REQUEST - ID: ${idStr}, Token: ${adminToken}`);

    if (!adminToken || adminToken !== "secret_token_123") {
      console.log("DELETE DENIED: Unauthorized");
      return res.status(403).json({ error: "Unauthorized - Please login again" });
    }

    const id = parseInt(idStr, 10);
    
    try {
      // Try numeric ID first
      const result = db.prepare("DELETE FROM portfolio WHERE id = ?").run(id);
      console.log(`Delete result (numeric ID ${id}):`, result);
      
      if (result.changes > 0) {
        return res.json({ success: true });
      }

      // Try string ID as fallback
      const resultStr = db.prepare("DELETE FROM portfolio WHERE id = ?").run(idStr);
      console.log(`Delete result (string ID ${idStr}):`, resultStr);

      if (resultStr.changes > 0) {
        return res.json({ success: true });
      }

      console.log(`DELETE FAILED: ID ${idStr} not found`);
      res.status(404).json({ error: "Item not found in database" });
    } catch (error) {
      console.error("DATABASE ERROR during delete:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/debug/portfolio", (req, res) => {
    try {
      const count = db.prepare("SELECT COUNT(*) as count FROM portfolio").get();
      const items = db.prepare("SELECT * FROM portfolio").all();
      res.json({ count, items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
