const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    gameType: {
        type: String,
        enum: ['single', 'multiplayer'],
        default: 'multiplayer'
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    botPlayers: [{
        id: String,
        name: String,
        isBot: { type: Boolean, default: true }
    }],
    currentPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
    },
    deck: [{
        color: String,
        value: String
    }],
    discardPile: [{
        color: String,
        value: String
    }],
    direction: {
        type: Number,
        default: 1  // 1 for clockwise, -1 for counter-clockwise
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting'
    },
    playerHands: {
        type: Map,
        of: [{
            color: String,
            value: String
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);