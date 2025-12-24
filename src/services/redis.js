const Redis = require("ioredis");
require("dotenv").config();

// Singleton Pattern: One connection for the whole app
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

const getRoomData = async (roomId) => {
  const roomKey = `room:${roomId}`;
  const [code, version] = await redis.hmget(roomKey, "code", "version");
  return { code, version: parseInt(version) || 0 };
};

const updateRoomData = async (roomId, code, version) => {
  const roomKey = `room:${roomId}`;
  await redis.hset(roomKey, "code", code, "version", version);
};

module.exports = { redis, getRoomData, updateRoomData };