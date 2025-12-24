const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomData = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    if (!roomData[roomId]) {
      roomData[roomId] = { code: "// start coding...", version: 0 };
    }
    socket.emit("init_code", roomData[roomId]); 
  });

  socket.on("code_change", ({ roomId, code, version }) => {
    if (!roomData[roomId]) return;
    const serverVersion = roomData[roomId].version;

    if (version !== serverVersion) {
      socket.emit("error_sync", { 
        message: "Version mismatch!", 
        latestCode: roomData[roomId].code,
        latestVersion: serverVersion 
      });
      return;
    }

    roomData[roomId].code = code;
    roomData[roomId].version += 1;
    
    socket.to(roomId).emit("receive_code", { 
      code: code, 
      version: roomData[roomId].version 
    });
    
    socket.emit("ack_code", { version: roomData[roomId].version });
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});