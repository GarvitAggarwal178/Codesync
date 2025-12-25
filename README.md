### **2. CodeSync README**

A real-time collaborative code editor with distributed state management and remote code execution.

**Tech Stack**

* **Frontend:** React, Monaco Editor (VS Code Engine)
* **Backend:** Node.js, Socket.io
* **Persistence:** Redis (Docker)
* **Execution:** Piston API (Sandboxed Proxy)

**Key Features**

* **Real-Time Sync:** Uses WebSockets for sub-50ms document updates across clients.
* **Stateless Backend:** Decouples state to Redis, allowing the server to crash or restart without data loss.
* **Concurrency Control:** Implements version tracking to reject conflicting edits and prevent race conditions.
* **Remote Execution:** Proxies code to a sandboxed environment to run 20+ languages securely.

**How to Run**

**1. Prerequisites**

* Docker (Required for Redis)
* Node.js (v16+)

**2. Infrastructure Setup**

```bash
# Start Redis container (Runs on port 6379)
docker run -d -p 6379:6379 --name codesync-redis redis

```

**3. Application Startup**

```bash
# Install dependencies
npm install

# Start the Development Server
# Runs backend on :3001 and frontend proxy on :3000
npm run dev

```

---

