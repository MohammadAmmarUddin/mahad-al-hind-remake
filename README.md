# 🌙 Ma'hadul Qiraat Al Hind — Full Stack Web Platform

Official digital platform for **Ma'hadul Qiraat Al Hind**, a Quranic education institute.
Built with a modern full-stack architecture using React, Node.js, and Dockerized infrastructure.

🌐 **Live:** [https://mahad-al-hind.netlify.app](https://mahad-al-hind.netlify.app)

---

## 📌 Overview

This project represents the official web presence of the institute — designed to showcase:

* Quranic courses & programs
* Admission information
* Scholars & instructors
* Institutional activities

The project follows a **monorepo architecture**:

* `client/` → React frontend (SPA)
* `server/` → REST API (Node.js + Express)

---

## ⚙️ Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Frontend   | React.js               |
| Backend    | Node.js, Express.js    |
| Database   | MongoDB (Mongoose)     |
| DevOps     | Docker, Docker Compose |
| CI/CD      | GitHub Actions         |
| Deployment | Netlify (Frontend)     |

---

## 🗂 Project Structure

```
mahad-al-hind-remake/
├── client/                # React frontend
├── server/                # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 🚀 Getting Started

### 🔧 Prerequisites

Make sure you have installed:

* Node.js (v18+)
* Docker & Docker Compose
* Git

---

### 🐳 Run with Docker (Recommended)

```bash
# Clone repo
git clone https://github.com/MohammadAmmarUddin/mahad-al-hind-remake.git
cd mahad-al-hind-remake

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Run project
docker compose -f docker-compose.dev.yml up --build
```

📍 Access:

* Client → [http://localhost:3000](http://localhost:3000)
* Server → [http://localhost:5000](http://localhost:5000)

---

### 💻 Run Without Docker

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm start
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
NODE_ENV=development
```

### Client (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

⚠️ Never commit `.env` files.

---

## 🐳 Docker Setup

### Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 🔄 CI/CD

Automated using **GitHub Actions**

Includes:

* Code linting & build checks
* Auto deployment (Netlify on push to `main/master`)

---

## 📜 Scripts

### Server

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

### Client

```bash
npm start       # Dev server
npm run build   # Production build
npm test        # Run tests
```

---

## 🤝 Contributing

Contributions are welcome.

```bash
1. Fork the repo
2. Create branch → feature/your-feature
3. Commit → feat: your update
4. Push & open PR
```

Or open an issue for suggestions.

---

## 👤 Author

**Engineer Qari Muhammad Ammar Uddin**
Full-Stack Developer • Qari of the Quran

* GitHub: [https://github.com/MohammadAmmarUddin](https://github.com/MohammadAmmarUddin)
* Contact: +8801883128299

---
