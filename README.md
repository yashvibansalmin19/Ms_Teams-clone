# CONNECT - Video Chat Application

A modern, real-time video conferencing application that allows multiple users to connect via video calls and chat. Built with WebRTC, Socket.io, and PeerJS.

**Live Demo:** [https://connectapp.up.railway.app](https://connectapp.up.railway.app)

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Set Up Environment Variables](#3-set-up-environment-variables)
  - [4. Set Up Google OAuth](#4-set-up-google-oauth)
  - [5. Set Up PostgreSQL Database](#5-set-up-postgresql-database)
  - [6. Run the Application](#6-run-the-application)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Google OAuth Login** - Secure authentication using Google accounts
- **Video Calling** - Real-time video calls with multiple participants
- **Audio Controls** - Mute/unmute microphone during calls
- **Video Controls** - Turn camera on/off with avatar placeholder
- **Real-time Chat** - Send messages during video calls
- **Participant Names** - Display names on video tiles
- **Status Indicators** - Visual mic mute indicators on video tiles
- **Share Meeting Link** - Copy and share meeting URLs with one click
- **Cross-Device Support** - Works on desktop, tablet, and mobile devices
- **TURN Server Support** - Reliable connections across different networks

## Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), EJS Templates |
| **Backend** | Node.js, Express.js |
| **Real-time Communication** | WebRTC, PeerJS, Socket.io |
| **Authentication** | Passport.js, Google OAuth 2.0 |
| **Database** | PostgreSQL, Sequelize ORM |
| **TURN/STUN** | Metered.ca TURN servers |
| **Deployment** | Railway |

## How It Works

1. **WebRTC getUserMedia API** - Captures video and audio from user's camera and microphone
2. **PeerJS** - Manages peer-to-peer connections between users with unique peer IDs
3. **Socket.io** - Handles real-time signaling for WebSocket connections
4. **TURN Servers** - Relays media when direct peer-to-peer connection isn't possible (different networks, NAT traversal)
5. **UUID** - Generates unique meeting room IDs for each session
6. **Google OAuth** - Authenticates users via their Google accounts
7. **PostgreSQL** - Stores user data, room information, and chat messages

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (local or cloud-hosted like Neon)
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Ms_Teams-clone.git
cd Ms_Teams-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/redirect

# Session
SESSION_SECRET=your_secure_random_string
COOKIE_KEYS=key1,key2

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/auth/google/redirect`
7. Copy the Client ID and Client Secret to your `.env` file

### 5. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
createdb connect_video_chat
```

**Option B: Neon (Free Cloud PostgreSQL)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string to your `.env` file

### 6. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Ms_Teams-clone/
├── config/
│   └── config.json       # Database configuration
├── models/
│   ├── index.js          # Sequelize setup
│   ├── User.js           # User model
│   ├── Room.js           # Room model
│   └── Message.js        # Message model
├── public/
│   ├── client.js         # Client-side WebRTC logic
│   ├── style.css         # Meeting page styles
│   ├── LoginPage.css     # Login page styles
│   └── styleNew.css      # Home page styles
├── views/
│   ├── login.ejs         # Login page
│   ├── HomePage.ejs      # Home page
│   └── newMeeting.ejs    # Meeting room page
├── server.js             # Express server & Socket.io
├── google-oauth.js       # Passport OAuth configuration
├── package.json
└── .env.example          # Environment variables template
```

## Deployment

### Railway Deployment

1. Push your code to GitHub
2. Create an account on [Railway](https://railway.app)
3. Create a new project and connect your GitHub repository
4. Add a PostgreSQL database to your project
5. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (automatically set by Railway)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL` (use your Railway app URL)
   - `SESSION_SECRET`
   - `COOKIE_KEYS`
   - `NODE_ENV=production`
6. Update Google OAuth redirect URI in Google Cloud Console

## Troubleshooting

### Video not working between different devices/networks

This is usually a NAT traversal issue. The app uses Metered.ca TURN servers to relay media when direct connections fail. If issues persist:
- Check browser console for errors
- Ensure TURN credentials are valid
- Try using the same WiFi network for testing

### Camera/Microphone not accessible

- Check browser permissions for camera and microphone
- Ensure HTTPS is used in production (required for getUserMedia)
- Try a different browser

### Google OAuth errors

- Verify redirect URI matches exactly in both `.env` and Google Cloud Console
- Check that OAuth consent screen is configured
- Ensure client ID and secret are correct

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built during Microsoft Engage Program '21
- Uses [PeerJS](https://peerjs.com/) for WebRTC abstraction
- Uses [Socket.io](https://socket.io/) for real-time communication
- Uses [Metered.ca](https://www.metered.ca/) for TURN server infrastructure
