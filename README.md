# Astitva - Secure Certificate Ledger

Astitva is a production-grade, secure, blockchain-backed birth and death certificate issuance and verification system built using the MERN stack (MongoDB, Express.js, React.js, Node.js). 

It prevents administrative certificate forgery by hashing certificate metadata and anchoring the signatures in a locally maintained cryptographic blockchain ledger using a Proof of Work (PoW) consensus simulation.

---

## 🚀 Key Features

*   **Secure Authentication**: Role-based registrar administrative access secured via JSON Web Tokens (JWT) and bcrypt password hashing.
*   **Cryptographic Ledger**: Automated block mining upon certificate generation using a custom SHA-256 Proof of Work (PoW) mining algorithm.
*   **Dual Verification Engine**: Publicly accessible validation panel that matches certificate hashes against the blockchain ledger database.
*   **Global Ledger Integrity Audits**: Automatic sequences traversal checking if any block is corrupted or altered.
*   **Interactive Analytics Dashboard**: Modern interface featuring dynamic SVG bar charts representing certificate distributions, recent block updates trackers, and in-memory search filters.
*   **Centralized Resilience boundaries**: Central error handlers on the backend and skeleton loader states with network error banners on the client.

---

## 📁 Project Structure

```text
astitva/
├── client/                 # React Frontend Client
│   ├── src/
│   │   ├── components/     # Reusable layout guards (ProtectedRoute)
│   │   ├── contexts/       # Global state providers (AuthContext)
│   │   ├── pages/          # Home, Login, Register, Dashboard, Verify
│   │   ├── services/       # Axios wrappers (api.js, certificateService.js)
│   │   └── index.css       # Tailwind base directives and styling
│   ├── tailwind.config.js  # Tailwind config
│   └── vite.config.js      # Vite compilation configs
└── server/                 # Express Backend Server
    ├── config/             # Database connection setups
    ├── controllers/        # Request handlers (auth, birth, death, verify)
    ├── middleware/         # Token validation and error middlewares
    ├── models/             # Mongoose schemas (User, Block, Birth, Death)
    ├── routes/             # Route configurations
    ├── services/           # Blockchain ledger service (PoW mining)
    └── server.js           # Server initialization entry point
```

---

## 🛠️ Setup & Execution Guide

### Prerequisites
*   Node.js (v18+)
*   MongoDB Local Community Server or Atlas account

### 1. Backend Setup
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/astitva
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open another terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite client:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:5173/`.

---

## 🔒 Security & Blockchain Mechanisms

### A. How Certificate Hashing Works
When a certificate is issued:
1. Properties (Child/Deceased Name, Date, Location, ID) are serialized into a uniform string.
2. A SHA-256 hash is computed representing the certificate signature.
3. This signature maps to a block index inside a database block ledger.

### B. Proof of Work Mining Loop
Our custom local blockchain validates blocks using a search puzzle:
```javascript
while (true) {
  hash = calculateHash(index, previousHash, timestamp, certificateHash, certificateType, nonce);
  if (hash.substring(0, DIFFICULTY) === TARGET) {
    break;
  }
  nonce++;
}
```
Each block must meet the difficulty constraint (e.g., hash begins with `00`). The CPU searches nonces until a hash signature matches. This ensures a transparent ledger history suitable for resume review sessions.

---

## 📄 License

This project is licensed under the MIT License.
