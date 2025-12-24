const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Redis = require("ioredis"); // The new DB driver

const app = express();
app.use(cors());

const server = http.createServer(app);

const redis = new Redis({
  host: "localhost", // Docker maps this to your machine
  port: 6379,
});

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const axios = require("axios");

app.use(express.json()); 

// THE COMPILER ENDPOINT
app.post("/run", async (req, res) => {
  const { code, language } = req.body;

  // Map our language names to Piston API versions
  // Piston requires a version number. We use common ones.
  const runtimeMap = {
    "javascript": { version: "18.15.0", language: "javascript" },
    "python": { version: "3.10.0", language: "python" },
    "c++": { version: "10.2.0", language: "c++" }
  };

  const runtime = runtimeMap[language] || runtimeMap["javascript"];

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: runtime.language,
      version: runtime.version,
      files: [{ content: code }],
    });

    // Send back the output (stdout) or error (stderr)
    res.json({ output: response.data.run.output });
  } catch (error) {
    res.status(500).json({ output: "Error executing code: " + error.message });
  }
});


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (roomId) => {
    socket.join(roomId);

    // 2. FETCH FROM REDIS (Database Call)
    // We use a Hash Map in Redis: "room:123" -> { code: "...", version: 5 }
    const roomKey = `room:${roomId}`;
    
    // Get both fields at once
    let [code, version] = await redis.hmget(roomKey, "code", "version");

    if (!code) {
      // If room is empty, initialize it in Redis
      code = "// Start coding...";
      version = 0;
      await redis.hset(roomKey, "code", code, "version", version);
    }

    // Send to client
    socket.emit("init_code", { code, version: parseInt(version) });
  });

  socket.on("code_change", async ({ roomId, code, version }) => {
    const roomKey = `room:${roomId}`;

    // 3. ATOMIC VERSION CHECK (The Logic)
    // Fetch the TRUE version from DB
    const currentVersion = parseInt(await redis.hget(roomKey, "version"));

    if (version !== currentVersion) {
      const latestCode = await redis.hget(roomKey, "code");
      socket.emit("error_sync", { 
        message: "Version Mismatch!", 
        latestCode: latestCode, 
        latestVersion: currentVersion 
      });
      return;
    }

    // 4. UPDATE DB
    await redis.hset(roomKey, "code", code, "version", version + 1);

    // 5. BROADCAST
    socket.to(roomId).emit("receive_code", { 
      code: code, 
      version: version + 1 
    });
    
    socket.emit("ack_code", { version: version + 1 });
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001 (Redis Connected)");
});