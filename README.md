# LinguaLearn

## Project Overview

**LinguaLearn** is an AI-powered multilingual study companion designed for children of Meesho sellers and low-income families in India. It provides personalized, child-friendly explanations in multiple Indian languages via a conversational chatbot interface, accessible through mobile browsers without the need for app installation.

**Sub-theme:** Personalized AI Assistant

## Features
- Voice and text input for student queries
- AI-generated, child-safe explanations (using GPT-3.5)
- Translation to Indian languages (Telugu, Hindi, etc.)
- Text-to-speech (TTS) audio replies
- Mobile-responsive chat interface
- Lightweight, browser-based, no installation required

## Tech Stack
- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **AI:** OpenAI GPT-3.5 API
- **Translation:** Google Cloud Translate API
- **Text-to-Speech:** Google Cloud TTS API, edge-tts (Python)
- **Python Service:** Flask (for TTS audio generation)


## Open-Source Attribution
| Name & Version                   | License     | Role in Build                        | Source Link                                         |
|----------------------------------|-------------|--------------------------------------|-----------------------------------------------------|
| React (^18.3.1)                  | MIT         | Frontend framework                   | https://react.dev/                                  |
| Tailwind CSS (^3.4.1)            | MIT         | Frontend styling                     | https://tailwindcss.com/                            |
| Vite (^5.4.2)                    | MIT         | Frontend build tool                  | https://vitejs.dev/                                 |
| Express (^4.18.2)                | MIT         | Backend API framework                | https://expressjs.com/                              |
| Node.js (runtime)                | MIT         | Backend runtime                      | https://nodejs.org/                                 |
| Mongoose (^7.0.0)                | MIT         | MongoDB object modeling              | https://mongoosejs.com/                             |
| Axios (^1.10.0)                  | MIT         | HTTP client (frontend-backend comms) | https://axios-http.com/                             |
| uuid (^11.1.0)                   | MIT         | Unique ID generation                 | https://github.com/uuidjs/uuid                      |
| dotenv (^16.0.0)                 | MIT         | Environment variable management      | https://github.com/motdotla/dotenv                  |
| bcryptjs (^3.0.2)                | MIT         | Password hashing                     | https://github.com/dcodeIO/bcrypt.js                |
| jsonwebtoken (^9.0.0)            | MIT         | JWT authentication                   | https://github.com/auth0/node-jsonwebtoken          |
| cors (^2.8.5)                    | MIT         | CORS middleware                      | https://github.com/expressjs/cors                   |
| nodemailer (^6.10.1)             | MIT         | Email sending                        | https://nodemailer.com/                             |
| node-fetch (^2.6.7, ^2.7.0)      | MIT         | HTTP requests                        | https://github.com/node-fetch/node-fetch            |
| @google-cloud/translate (^9.2.0) | Apache-2.0  | Translation API client               | https://github.com/googleapis/nodejs-translate      |
| Flask (Python)                   | BSD         | Python web server for TTS            | https://flask.palletsprojects.com/                  |
| edge-tts (Python)                | MIT         | TTS synthesis (Python)               | https://github.com/ranyelhousieny/edge-tts          |
| Google Cloud Translate API       | Proprietary | Translation service (API)            | https://cloud.google.com/translate                  |


## Prototype Showcase
- **Live Demo:** https://lingualearn-lingo.vercel.app/
- **Source Code:** https://github.com/aleti-poojitha/LinguaLearn/
- **README/Setup:** https://github.com/aleti-poojitha/LinguaLearn/edit/main/README.md
- **Sub-theme:** Personalized AI Assistant


## Local Setup Instructions
### Prerequisites
- Node.js (v18+ recommended)
- Python 3.8+
- MongoDB (local or cloud instance)
- Google Cloud credentials for Translate and TTS APIs
- OpenAI API key

### 1. Clone the repository
git clone [your-repo-url]
cd [your-repo-folder]

### 2. Setup Backend
cd backend
npm install
# Add your environment variables in a .env file (see .env.example if present)
npm run dev

### 3. Setup Python TTS Service
cd backend
pip install flask edge-tts
python tts_service.py

### 4. Setup Frontend
cd ..
npm install
npm run dev

### 5. Access the App
Open your browser and go to `http://localhost:5173` (or the port shown in your terminal).
