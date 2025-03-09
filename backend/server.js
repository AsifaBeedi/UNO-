const express = require("express")
const mongoose = require ("mongoose")
const cors = require ("cors")
const Player = require("./models/player")
require("dotenv").config();

const app = express()
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3001' // Update this to match your frontend port
}))

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

const gameRoutes = require('./routes/gameroutes');  // Note the updated path
app.use('/api', gameRoutes);

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("Connected to MongoDB"))
.catch((err)=>console.log("MongoDB conection error",err))



app.get("/", (req, res) => {
    res.send("Backend Baddie is officially ON 🔥💅");
  });
  
app.post("/players", async (req, res) => { 
    const { name } = req.body;
  
    const player = new Player({ name });
    await player.save();
  
    res.json(player);
  });
  
app.get("/players", async (req, res) => {
    try {
      const players = await Player.find();
      res.json(players);
    } catch (err) {
      res.status(500).json({ message: "Something went wrong 💀" });
    }
  });

  app.delete("/players/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await Player.findByIdAndDelete(id);
      res.json({ message: "Player removed 🚩" });
    } catch (err) {
      res.status(500).json({ message: "Could not delete player 💀" });
    }
  });
  
// Update Player Name
app.put("/players/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const player = await Player.findByIdAndUpdate(id, { name }, { new: true });
      res.json(player);
    } catch (err) {
      res.status(500).json({ message: "Can't update player 💀" });
    }
  });
  
app.listen(3000,()=>{
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
});