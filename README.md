### **CodeSync Pro**

A real-time collaborative code editor with distributed state management and remote code execution.

**Tech Stack**

* **Frontend:** React, Monaco Editor (VS Code Engine)
* **Backend:** Node.js, Socket.io
* **Persistence:** Redis (Docker)
* **Execution:** Piston API (Sandboxed)

**Key Features**

* **Real-Time Sync:** Uses WebSockets for sub-50ms document updates across clients.
* **Stateless Backend:** Decouples state to Redis, allowing the server to crash or restart without data loss.
* **Concurrency Control:** Implements version tracking to reject conflicting edits and prevent race conditions.
* **Remote Execution:** Proxies code to a sandboxed environment to run 20+ languages securely.

**Setup & Run**

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis

# 2. Install Dependencies
npm install

# 3. Start Server
npm start

```

---
