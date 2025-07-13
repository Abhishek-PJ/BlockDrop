# 🚀 BlockDrop – Decentralized Secure File Sharing

**BlockDrop** is a decentralized and secure file sharing platform built with the **MERN stack** and **Ethereum Blockchain**. This app ensures that all uploaded files are encrypted, verified for integrity, and can be validated using blockchain-backed proof — making it ideal for privacy-focused, tamper-proof sharing.

---

## 📸 Application Interface

![Home Page](https://drive.google.com/uc?id=16JJWOkLEqkbo5DY0EVoL4OHxUkzUhWmG)
![Dashboard](https://drive.google.com/uc?id=1vSePIkEX5Hk2g6x2Hghs8dKUFiB0F-Pj)
![Download Page](https://drive.google.com/uc?id=1vSePIkEX5Hk2g6x2Hghs8dKUFiB0F-Pj)
![FileUpload_BlockChain](https://drive.google.com/uc?id=1mXWl8tv79r_AX1QbImmi-_Lf7Q8BT4kL)
![File Upload History](https://drive.google.com/uc?id=1oGCdbRCTHgN3jCr82Ps_2R-20QXCz17Z)
![Send Normal](https://drive.google.com/uc?id=1likqe6pP8NMFEimyvGUeQIWyKccA9R-K)
![Download Page](https://drive.google.com/uc?id=1m3sRVo0nTze8mYFuDF3MKJ398CeOPA2J)









---

## 📹 Video Demo

Watch a walkthrough of **BlockDrop** in action:


> 🔗 **[Click here to watch the video demo](https://drive.google.com/drive/folders/1KUv6OraBeQ9FdYIn6fzZyj9tI-uR4zbd?usp=drive_link)**

---

## 🔐 Key Features

- **🔒 End-to-End Encryption**  
  Files are encrypted in the browser before upload and decrypted only by the receiver.

- **🔑 Password Protection**  
  Optional passwords add a second layer of protection to access shared files.

- **⛓️ Blockchain File Verification**  
  File hashes are stored on the Ethereum blockchain to allow future verification.

- **🧼 Input Sanitization & XSS/NoSQL Injection Protection**  
  Protects against common web vulnerabilities and exploits.

- **🛡️ Brute Force & Rate Limit Protection**  
  Prevents repeated unauthorized access attempts with rate-limiting.

- **📜 Auto-Deleting Files**  
  Shared files are automatically removed from the server after the first successful download.

---

## ⚙️ Technologies Used

- **Frontend:** React + Vite
- **Backend:** Express.js + Node.js
- **Database:** MongoDB
- **Authentication:** Clerk.dev
- **Email:** Mailjet API
- **File Upload:** Multer
- **Blockchain:** Solidity + Hardhat + Ethers.js

---

## 🧑‍💻 Getting Started

### 🔧 Prerequisites

- Node.js
- MongoDB Atlas account
- Ethereum testnet (like Hardhat local node or Alchemy RPC)
- Mailjet & Clerk accounts

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Abhihawkz/BlockDrop.git
cd BlockDrop
```

### 2. Backend Environment Variables (`/server/.env`)

```env
MONGO_URI=your_mongodb_connection
MJ_APIKEY_PUBLIC=your_mailjet_public_key
MJ_APIKEY_PRIVATE=your_mailjet_private_key
BLOCKCHAIN_PROVIDER=http://localhost:8545
CONTRACT_ADDRESS=your_deployed_contract_address
```

### 3. Client Environment Variables (`/client/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 4. Start Smart Contract Development (from `/blockchain`)

```bash
npm install
npx hardhat node      # Run local blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Start Backend Server

```bash
cd server
npm install
node server.js
```

### 6. Start React Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Whether it's fixing bugs, improving UI, or adding new features—feel free to create a pull request.

---
