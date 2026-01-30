# Easy-Notes 📝

A modern, full-stack note-taking application designed for taking, organizing, and managing your notes effortlessly.
Built with Vue.js, Node.js, and MongoDB.

## 🌐 Live Demo

[https://easy-notes-ecru.vercel.app/](https://easy-notes-ecru.vercel.app/)
(the site might take some time to wake up if not used recently)

## ✨ Features

- 📚 Organize notes into notebooks and classes
- 📄 PDF upload and preview capabilities
- ✏️ Rich text editing with Markdown support
- 🔐 Secure authentication with JWT
- 🔔 Push notifications support
- 📱 Responsive design with Tailwind CSS
- 🤖 AI-powered summaries with Cerebras integration

## 🏗️ Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** Vue Router
- **State Management:** Pinia
- **Build Tool:** Vite
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript
- **Database:** MongoDB Atlas
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer with GridFS
- **API Documentation:** Swagger
- **Deployment:** Render

## 🚀 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Easy-Notes.git
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

Configure your `.env` file with the following variables:

```env
FRONTEND_URL=http://localhost:5173
MONGO_URI= your_mongodb_connection_string_here
CEREBRAS_API_KEY= your_cerebras_api_key_here
JWT_SECRET= your_jwt_secret_here (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
VAPID_PUBLIC_KEY= your_vapid_public_key_here
VAPID_PRIVATE_KEY= your_vapid_private_key_here
(`npx web-push generate-vapid-keys`)
NODE_ENV=development
```

```bash
# Start development server
npm run dev
```

The backend will run on `http://localhost:3000`
The API documentation is available at `http://localhost:3000/api/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

Configure your `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY= your_vapid_public_key_here
```

```bash
# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Testing the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account or sign in
3. Start creating notebooks and taking notes!

## 🌐 Deployment

### Architecture Overview

The application is deployed using a modern cloud-native architecture with separation between frontend, backend, and database:

### Backend - [Render](https://render.com)

The Node.js/Express backend is hosted on Render with automatic deployment from GitHub.

### Frontend - [Vercel](https://vercel.com)

The Vue.js frontend is deployed on Vercel.

🔗 **Live Application:** [https://easy-notes-ecru.vercel.app/](https://easy-notes-ecru.vercel.app/)

### Database - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

The MongoDB database is hosted on MongoDB Atlas for reliable cloud storage.

## 📄 License

This project is licensed under the GNU General Public License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Emanuele Sanchi - [GitHub](https://github.com/manusanchi02)
Francesco Buda - [GitHub](https://github.com/FrancescoBuda3)
Tommaso Severi - [GitHub](https://github.com/sevetom)

