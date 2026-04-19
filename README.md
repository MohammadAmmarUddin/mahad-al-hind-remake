Ma'hadul Qiraat Al Hind — Full Stack Web Platform

Official web platform for Ma'hadul Qiraat Al Hind, a premier Quranic education institute. Built with a modern full-stack architecture featuring a React-based client and a Node.js/Express REST API, containerized with Docker and deployed via CI/CD pipelines.

🌐 Live: mahad-al-hind.netlify.app

Table of Contents

Overview
Tech Stack
Project Structure
Getting Started

Prerequisites
Development (Docker)
Local Setup Without Docker


Environment Variables
Docker
CI/CD
Scripts
Contributing
Author


Overview
This is a full-stack remake of the Ma'hadul Qiraat Al Hind institutional website. The platform serves as the official digital presence of the institute — showcasing courses, admissions, scholars, and Quranic education programs.
The project is structured as a monorepo with two primary workspaces:

client/ — React.js frontend (SPA)
server/ — Node.js + Express REST API backend

Both services are orchestrated via Docker Compose for local development and production environments.

Tech Stack
LayerTechnologyFrontendReact.js, JavaScriptBackendNode.js, Express.jsDatabaseMongoDB (via Mongoose)ContainerizationDocker, Docker ComposeCI/CDGitHub ActionsDeploymentNetlify (client), configurable for serverDev EnvironmentVS Code Dev Containers

Project Structure
mahad-al-hind-remake/
├── client/                  # React frontend application
│   ├── public/
│   └── src/
├── server/                  # Node.js + Express backend API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
├── .github/
│   └── workflows/           # GitHub Actions CI/CD pipelines
├── .devcontainer/           # VS Code Dev Container configuration
├── .vscode/                 # Workspace settings
├── docker-compose.dev.yml   # Docker Compose for development
├── docker-compose.prod.yml  # Docker Compose for production
├── .dockerignore
├── .gitignore
└── README.md

Getting Started
Prerequisites
Make sure you have the following installed on your machine:

Node.js v18+
Docker & Docker Compose
Git

Development (Docker)
The recommended way to run the project locally is via Docker Compose.
bash# Clone the repository
git clone https://github.com/MohammadAmmarUddin/mahad-al-hind-remake.git
cd mahad-al-hind-remake

# Copy and configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start development environment
docker compose -f docker-compose.dev.yml up --build
Once running:

Client → http://localhost:3000
Server → http://localhost:5000

Local Setup Without Docker
If you prefer to run each service individually:
Backend
bashcd server
npm install
npm run dev
Frontend
bashcd client
npm install
npm start

Environment Variables
Server (server/.env)
envPORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
Client (client/.env)
envREACT_APP_API_URL=http://localhost:5000/api

Never commit .env files. They are listed in .gitignore.


Docker
Two Docker Compose configurations are provided:
Development — includes hot reload and volume mounts:
bashdocker compose -f docker-compose.dev.yml up --build
Production — optimized builds, no dev dependencies:
bashdocker compose -f docker-compose.prod.yml up --build -d

CI/CD
The project uses GitHub Actions for automated workflows. Pipelines are located in .github/workflows/.
Typical workflow includes:

Linting and build checks on pull requests
Automated deployment to Netlify on push to master


Scripts
Server
CommandDescriptionnpm run devStart server with nodemon (hot reload)npm startStart server in production mode
Client
CommandDescriptionnpm startStart React development servernpm run buildCreate production buildnpm testRun test suite

Contributing
This is an institutional project. If you'd like to suggest improvements or report an issue, feel free to open an Issue or submit a Pull Request.

Fork the repository
Create your feature branch: git checkout -b feature/your-feature-name
Commit your changes: git commit -m "feat: add your feature"
Push to the branch: git push origin feature/your-feature-name
Open a Pull Request


Author
Engineer Qari Muhammad Ammar Uddin
Full-Stack Developer | Qari of the Quran
Chittagong, Bangladesh

GitHub: @MohammadAmmarUddin
Contact: +8801883128299
