const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    isPlaying: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}); // Remove the trailing comma after the last property

module.exports = mongoose.model("Player", playerSchema);