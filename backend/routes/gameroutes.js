const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const Player = require('../models/player');

console.log('Game routes loading...');
// Create a new game (single or multiplayer)
router.post('/games', async (req, res) => {
    try {
        const { gameType = 'multiplayer', playerId } = req.body;
        const game = new Game({
            status: 'waiting',
            gameType,
            deck: generateDeck(),
            discardPile: []
        });

        // Add the creating player
        game.players.push(playerId);

        // If single player, add a bot
        if (gameType === 'single') {
            game.botPlayers.push({
                id: 'bot-' + Date.now(),
                name: 'UNO Bot'
            });
            // Start game immediately in single player mode
            game.status = 'active';
            game.currentPlayer = playerId;
            dealInitialCards(game);
        }

        await game.save();
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: "Error creating game" });
    }
});

// Join a multiplayer game
router.post('/games/:gameId/join', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { playerId } = req.body;
        
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        if (game.gameType === 'single') {
            return res.status(400).json({ message: "Cannot join a single player game" });
        }
        
        if (game.players.length >= 4) {
            return res.status(400).json({ message: "Game is full" });
        }
        
        game.players.push(playerId);
        
        if (game.players.length >= 2) {
            game.status = 'active';
            game.currentPlayer = game.players[0];
            dealInitialCards(game);
        }
        
        await game.save();
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: "Error joining game" });
    }
});

// Play a card
router.post('/games/:gameId/play', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { playerId, cardIndex } = req.body;
        
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        if (game.currentPlayer.toString() !== playerId) {
            return res.status(400).json({ message: "Not your turn" });
        }
        
        const playerHand = game.playerHands.get(playerId);
        const card = playerHand[cardIndex];
        
        const topCard = game.discardPile[game.discardPile.length - 1];
        if (!canPlayCard(card, topCard)) {
            return res.status(400).json({ message: "Invalid move" });
        }
        
        // Play the card
        playerHand.splice(cardIndex, 1);
        game.discardPile.push(card);
        
        // Check for winner
        if (playerHand.length === 0) {
            game.status = 'finished';
            game.winner = playerId;
            await game.save();
            return res.json({ 
                message: "Game Over! You won!", 
                game 
            });
        }
        
        handleSpecialCard(game, card);
        
        // Move to next player
        moveToNextPlayer(game);
        
        // If next player is a bot, make their move
        if (game.gameType === 'single' && isCurrentPlayerBot(game)) {
            makeBotMove(game);
        }
        
        await game.save();
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: "Error playing card" });
    }
});

// Draw a card
router.post('/games/:gameId/draw', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { playerId } = req.body;
        
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        if (game.currentPlayer.toString() !== playerId) {
            return res.status(400).json({ message: "Not your turn" });
        }
        
        const playerHand = game.playerHands.get(playerId);
        
        // If deck is empty, shuffle discard pile
        if (game.deck.length === 0) {
            const topCard = game.discardPile.pop();
            game.deck = shuffle(game.discardPile);
            game.discardPile = [topCard];
        }
        
        // Draw card
        playerHand.push(game.deck.pop());
        
        // Move to next player
        moveToNextPlayer(game);
        
        // If next player is a bot, make their move
        if (game.gameType === 'single' && isCurrentPlayerBot(game)) {
            makeBotMove(game);
        }
        
        await game.save();
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: "Error drawing card" });
    }
});

// Helper functions
function isCurrentPlayerBot(game) {
    return game.botPlayers.some(bot => bot.id === game.currentPlayer.toString());
}

function makeBotMove(game) {
    const botHand = game.playerHands.get(game.currentPlayer.toString());
    const topCard = game.discardPile[game.discardPile.length - 1];
    
    // Get all playable cards
    const playableCards = botHand.map((card, index) => ({card, index}))
                                .filter(({card}) => canPlayCard(card, topCard));
    
    if (playableCards.length > 0) {
        // Prioritize cards in this order:
        // 1. Special cards (+4, +2, skip, reverse) when bot is losing
        // 2. Number cards of the same color as top card
        // 3. Number cards of different color
        // 4. Wild cards (save them for when needed)
        
        let selectedCard = null;
        
        // If bot is losing and has special cards, play them
        if (botHand.length > game.playerHands.get(game.players[0].toString()).length) {
            selectedCard = playableCards.find(({card}) => 
                ['skip', 'reverse', '+2', '+4'].includes(card.value));
        }
        
        // If no special card selected, prefer same color
        if (!selectedCard) {
            selectedCard = playableCards.find(({card}) => 
                card.color === topCard.color);
        }
        
        // If still no card selected, use first playable card
        if (!selectedCard) {
            selectedCard = playableCards[0];
        }
        
        // Play the selected card
        const card = botHand[selectedCard.index];
        botHand.splice(selectedCard.index, 1);
        game.discardPile.push(card);
        
        // If wild card, choose most common color in hand
        if (card.color === 'wild') {
            const colorCounts = botHand.reduce((counts, c) => {
                if (c.color !== 'wild') counts[c.color] = (counts[c.color] || 0) + 1;
                return counts;
            }, {});
            card.color = Object.entries(colorCounts)
                              .sort(([,a], [,b]) => b - a)[0][0] || 'red';
        }
        
        // Check for winner
        if (botHand.length === 0) {
            game.status = 'finished';
            game.winner = game.currentPlayer;
            return;
        }
        
        handleSpecialCard(game, card);
    } else {
        // Draw a card
        if (game.deck.length === 0) {
            const topCard = game.discardPile.pop();
            game.deck = shuffle(game.discardPile);
            game.discardPile = [topCard];
        }
        botHand.push(game.deck.pop());
    }
    
    moveToNextPlayer(game);
}

function moveToNextPlayer(game) {
    const currentPlayerIndex = game.players.findIndex(p => p.toString() === game.currentPlayer.toString());
    const nextPlayerIndex = (currentPlayerIndex + game.direction + game.players.length) % game.players.length;
    game.currentPlayer = game.players[nextPlayerIndex];
}

function generateDeck() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const specials = ['skip', 'reverse', '+2'];
    const deck = [];
    
    colors.forEach(color => {
        numbers.forEach(num => {
            deck.push({ color, value: num });
            if (num !== '0') {
                deck.push({ color, value: num });
            }
        });
        
        specials.forEach(special => {
            deck.push({ color, value: special });
            deck.push({ color, value: special });
        });
    });
    
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'wild' });
        deck.push({ color: 'wild', value: '+4' });
    }
    
    return shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function dealInitialCards(game) {
    game.playerHands = new Map();
    game.players.forEach(playerId => {
        const hand = game.deck.splice(0, 7);
        game.playerHands.set(playerId.toString(), hand);
    });
    game.discardPile = [game.deck.pop()];
}

function canPlayCard(card, topCard) {
    return card.color === 'wild' || 
           card.color === topCard.color || 
           card.value === topCard.value;
}

function handleSpecialCard(game, card) {
    switch(card.value) {
        case 'reverse':
            game.direction *= -1;
            break;
        case 'skip':
            game.currentPlayer = game.players[(game.players.indexOf(game.currentPlayer) + game.direction + game.players.length) % game.players.length];
            break;
        case '+2':
            const nextPlayer = game.players[(game.players.indexOf(game.currentPlayer) + game.direction + game.players.length) % game.players.length];
            const hand = game.playerHands.get(nextPlayer.toString());
            hand.push(...game.deck.splice(0, 2));
            break;
        case '+4':
            const nextPlayerWild = game.players[(game.players.indexOf(game.currentPlayer) + game.direction + game.players.length) % game.players.length];
            const wildHand = game.playerHands.get(nextPlayerWild.toString());
            wildHand.push(...game.deck.splice(0, 4));
            break;
    }
}

module.exports = router;