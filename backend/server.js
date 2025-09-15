const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { spawn } = require("child_process");
require("dotenv").config();

const HousePoint = require("./models/HousePoint");
const leaderboardRouter = require("./routes/leaderboard");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://hogwarts-leaderboard-c9fc1fyj5-ashweks-projects.vercel.app/",
            "https://your-frontend-domain.vercel.app",
          ]
        : ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://your-frontend-domain.netlify.app",
            "https://your-frontend-domain.vercel.app",
          ]
        : ["http://localhost:3000"],
  })
);
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/hogwarts-leaderboard"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", leaderboardRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Function to ingest house point events
async function ingestEvent(eventData) {
  try {
    const housePoint = new HousePoint({
      id: eventData.id,
      category: eventData.category,
      points: eventData.points,
      timestamp: new Date(eventData.timestamp),
    });

    await housePoint.save();
    console.log(
      `Ingested: ${eventData.category} got ${eventData.points} points`
    );

    // Emit to all connected clients
    io.emit("newPoints", eventData);

    return housePoint;
  } catch (error) {
    console.error("Error ingesting event:", error);
    throw error;
  }
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
let dataGenProcess = null;

function startDataGenerator() {
  if (dataGenProcess) {
    console.log("Data generator already running");
    return;
  }

  dataGenProcess = spawn("python", ["data_gen.py"], {
    cwd: __dirname,
    stdio: ["pipe", "pipe", "pipe"],
  });

  dataGenProcess.stdout.on("data", async (data) => {
    const lines = data.toString().trim().split("\n");

    for (const line of lines) {
      if (line.trim()) {
        try {
          const eventData = JSON.parse(line);
          await ingestEvent(eventData);
        } catch (error) {
          console.error("Error parsing data generator output:", error);
        }
      }
    }
  });

  dataGenProcess.stderr.on("data", (data) => {
    console.error("Data generator error:", data.toString());
  });

  dataGenProcess.on("close", (code) => {
    console.log(`Data generator process exited with code ${code}`);
    dataGenProcess = null;
  });

  console.log("Data generator started");
}

function stopDataGenerator() {
  if (dataGenProcess) {
    dataGenProcess.kill();
    dataGenProcess = null;
    console.log("Data generator stopped");
  }
}

// API endpoint to control data generator
app.post("/api/generator/start", (req, res) => {
  startDataGenerator();
  res.json({ message: "Data generator started" });
});

app.post("/api/generator/stop", (req, res) => {
  stopDataGenerator();
  res.json({ message: "Data generator stopped" });
});

// Manual event ingestion endpoint
app.post("/api/events", async (req, res) => {
  try {
    const event = await ingestEvent(req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  stopDataGenerator();
  mongoose.connection.close();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (process.env.NODE_ENV !== "production") {
    setTimeout(startDataGenerator, 2000);
  }
});
