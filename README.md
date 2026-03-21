# Secure Online Forum

A full-stack web application implementing a secure, end-to-end encrypted group messaging forum. All cryptographic operations are performed client-side, ensuring the server never has access to plaintext messages.

## Features

- **RSA Digital Signature Authentication** — Users authenticate by signing a server-generated nonce with their private key, eliminating password-based login
- **End-to-End Encrypted Messaging** — Messages are encrypted client-side using RSA-OAEP before transmission; the server only stores ciphertext
- **Anonymous Group Chat** — Users within a group are identified only by opaque IDs, providing pseudonymous communication
- **Client-Side Key Generation** — RSA key pairs for both signing and encryption are generated in the browser using the Web Crypto API
- **JWT Session Management** — Access and refresh tokens with automatic rotation and secure HTTP-only cookies
- **HTTPS Transport** — All communication is encrypted in transit via TLS

## Architecture

```
┌──────────────────────┐         HTTPS         ┌──────────────────────┐
│      Frontend        │◄─────────────────────►│       Backend        │
│   React + Vite       │                        │   Express.js (Node)  │
│                      │                        │                      │
│  - Web Crypto API    │                        │  - JWT Auth          │
│  - RSA key gen       │                        │  - Nonce generation  │
│  - Message encrypt/  │                        │  - RSA signature     │
│    decrypt           │                        │    verification      │
│  - Nonce signing     │                        │  - MySQL database    │
└──────────────────────┘                        └──────────────────────┘
```

**Frontend** (port 3001): React SPA built with Vite. Handles all cryptographic operations — key generation, nonce signing, message encryption/decryption — entirely in the browser.

**Backend** (port 3000): Express.js API server. Manages user registration, signature verification, group management, and encrypted message storage. Never processes plaintext message content.

**Database**: MySQL with four tables — `users`, `groups`, `user_groups`, `messages`.

## Security Model

1. **Registration**: The client generates an RSA signing key pair (RSASSA-PKCS1-v1_5, 2048-bit). The public key is sent to the server; the private key stays with the user.
2. **Login**: The server issues a random nonce. The client signs it with the user's private key. The server verifies the signature against the stored public key and issues JWT tokens.
3. **Group Creation**: A separate RSA key pair is generated for group authentication, and an RSA-OAEP key pair is generated for message encryption. The encryption public key is stored server-side; private keys are given to the group creator.
4. **Joining a Group**: Users must possess the group's signing private key to prove authorization (sign a server-generated nonce).
5. **Messaging**: Messages are encrypted client-side with the group's RSA-OAEP public key before being sent to the server. Only users with the decryption private key can read them.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router, Vite        |
| Backend    | Node.js, Express.js                 |
| Database   | MySQL                               |
| Auth       | JWT (access + refresh tokens)       |
| Crypto     | Web Crypto API (client), Node.js crypto (server) |
| Transport  | HTTPS with self-signed certificates |

## Getting Started

### Prerequisites

- Node.js
- MySQL server
- SSL certificates (self-signed for development)

### Setup

1. **Install dependencies** in both the frontend and server directories:

   ```bash
   cd frontend && npm install
   cd ../server && npm install
   ```

2. **Configure the database** — Create a `.env` file in `server/src/` with:

   ```
   HOST=<your-mysql-host>
   USER=<your-mysql-user>
   PASSWORD=<your-mysql-password>
   DATABASE=<your-database-name>
   PORT=3000
   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   ```

3. **Initialize the database** — Run the SQL statements in `server/src/databaseInit.txt` to create the required tables.

4. **Generate SSL certificates** — Place `server-key.pem`, `server-cert.pem`, and `ca.pem` in `server/src/certs/`.

5. **Start the server**:

   ```bash
   cd server && npm run dev
   ```

6. **Build and start the frontend**:

   ```bash
   cd frontend && npm run build && npm run dev
   ```

7. Open `https://localhost:3001` in your browser.

## API Endpoints

| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | `/registerUser`                  | Register a new user with public key|
| POST   | `/getUserNonce`                  | Request a login nonce              |
| POST   | `/login`                         | Verify signed nonce, issue tokens  |
| POST   | `/logout`                        | Invalidate refresh token           |
| POST   | `/refreshToken`                  | Rotate access/refresh tokens       |
| POST   | `/createGroup`                   | Create an encrypted group          |
| POST   | `/generateGroupNonce`            | Request a group auth nonce         |
| POST   | `/addUserToGroup`                | Join a group (requires signed nonce)|
| POST   | `/removeGroupUser`               | Remove a user from a group         |
| POST   | `/storeEncryptedMessage`         | Store an encrypted message         |
| GET    | `/getEncryptedMessage/:groupId`  | Retrieve encrypted group messages  |
| POST   | `/getGroupPublicKey`             | Get a group's signing public key   |
| POST   | `/getGroupEncryptionKey`         | Get a group's encryption public key|

## Database Schema

```sql
users (userId PK, publicKey, nonce, refreshToken)
groups (groupId PK, groupPublicKey, groupNonce, encryptionKey)
user_groups (userId FK, groupId FK) -- composite PK
messages (messageId PK, encryptedMessage, groupId FK)
```

## License

This project was developed as an academic exercise in applied cryptography and secure systems design.
