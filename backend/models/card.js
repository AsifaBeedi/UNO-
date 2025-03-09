const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    color: {
        type: String,
        enum: ['red', 'blue', 'green', 'yellow', 'wild'],
        required: true
    },
    value: {
        type: String,
        required: true
        // 0-9, skip, reverse, +2, +4, wild
    }
});

module.exports = mongoose.model("Card", cardSchema);