# UNO Game - Next.js, TypeScript, React & Node.js

## 📌 Project Overview
This is a digital version of the classic **UNO** card game, built with modern web technologies for a seamless multiplayer experience. The game features real-time interactions, an intuitive UI, and a backend powered by **Node.js and MongoDB** to handle game logic and state management.

## 🚀 Technologies Used
### **Frontend**
- **Next.js** - Server-side rendering and optimized performance
- **React.js** - Component-based UI development
- **TypeScript** - Strongly-typed JavaScript for better code maintainability

### **Backend**
- **Node.js & Express.js** - REST API for game state management
- **MongoDB & Mongoose** - Storing game states, user progress, and leaderboards
- **Socket.io** - Real-time multiplayer functionality

### **Other Tools**
- **Redux / Zustand** - State management for smooth UI updates
- **Tailwind CSS** - Styling and responsiveness
- **dotenv** - Managing environment variables
- **Nodemon** - Auto-restarting server for development

## 🎮 Features
✅ Multiplayer support (real-time gameplay with WebSockets)
✅ Intuitive UI with smooth animations
✅ Game state management with Redux/Zustand
✅ Custom UNO rules (Optional: Add house rules)
✅ Persistent user sessions and leaderboards
✅ Secure authentication (OAuth / Firebase / JWT)
✅ Interactive game lobby and matchmaking
✅ AI-based bot opponents (if playing solo mode)

## 📂 Folder Structure
```
```

## 🛠️ Installation & Setup
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-username/uno-game.git
cd uno-game
```

### **2️⃣ Install Dependencies**
#### Frontend
```sh
cd frontend
npm install  # or yarn install
```

#### Backend
```sh
cd backend
npm install
```

### **3️⃣ Setup Environment Variables**
Create a `.env` file in the `backend` directory and add:
```sh
MONGODB_URI=your-mongodb-connection-string
PORT=3000
```

### **4️⃣ Run the Application**
#### Start Backend (Node.js & Express)
```sh
cd backend
npm start  # Runs 'nodemon server.js'
```

#### Start Frontend (Next.js)
```sh
cd frontend
npm run dev
```

## 🔗 API Endpoints (Example)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test` | Check if server is running |
| POST | `/players` | Add a new player |
| GET | `/players` | Get all players |
| PUT | `/players/:id` | Update player name |
| DELETE | `/players/:id` | Remove a player |

## 📜 How to Play
1️⃣ Join a game lobby or create a new one.  
2️⃣ Invite friends or play against AI.  
3️⃣ Follow UNO rules – match cards by color or number.  
4️⃣ Use special action cards wisely!  
5️⃣ First player to empty their hand wins! 🎉  

## 📌 Future Improvements
- 🌍 Deploy on **Vercel** (Frontend) and **Heroku / AWS** (Backend)
- 🔥 Improve AI opponent strategies
- 🎨 Dark mode UI
- 🎭 More UNO variations (e.g., Stack rule, Jump-in rule)
- 📱 Mobile app support with React Native

## 📞 Contact & Contributions
Want to contribute? Fork the repo and submit a PR!  
📧 **Email:** asifabandulalbeedi@gmail.com  
🔗 **LinkedIn:** [Asifa Bandulal Beedi](https://www.linkedin.com/in/asifa-bandulal-beedi)  
🐙 **GitHub:** [AsifaBeedi](https://github.com/AsifaBeedi)

Happy Coding! 🚀🎮

