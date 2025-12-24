const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { executeCode } = require("./src/controllers/compiler");
const { getRoomData, updateRoomData } = require("./src/services/redis");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// API Routes
app.post("/run", executeCode);

// Socket Logic
io.on("connection", (socket) => {
  console.log(`User: ${socket.id}`);

  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    const { code, version } = await getRoomData(roomId);
    // If no code exists, default to a comment
    const finalCode = code || "// Select a language and start coding!";
    socket.emit("init_code", { code: finalCode, version });
  });

  socket.on("code_change", async ({ roomId, code, version }) => {
    const { version: currentVersion, code: latestCode } = await getRoomData(roomId);

    if (version !== currentVersion) {
      socket.emit("error_sync", { 
        message: "Sync Error", 
        latestCode, 
        latestVersion: currentVersion 
      });
      return;
    }

    await updateRoomData(roomId, code, version + 1);
    
    socket.to(roomId).emit("receive_code", { code, version: version + 1 });
    socket.emit("ack_code", { version: version + 1 });
  });
});

server.listen(3001, () => console.log("SERVER RUNNING ON PORT 3001"));