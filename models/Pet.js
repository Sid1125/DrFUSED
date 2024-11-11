const mongoose = require('mongoose');

// Define a schema for the Pet model
const PetSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Reference to the user
    name: { type: String, required: true },
    level: { type: Number, default: 1 },
    type: { type: String, required: true },
    tier: { type: String, required: true }, // Add tier attribute
    health: { type: Number, default: 100 }, // Add health attribute
    happiness: { type: Number, default: 100 }, // Add happiness attribute
    items: [{ type: String }], // Array to hold item names the pet can use
});

// Method to get buffs based on pet tier
PetSchema.methods.getBuffs = function () {
    switch (this.tier) {
        case 'common':
            return { attack: 1, defense: 1, magic: 0 }; // Common pets have low buffs
        case 'uncommon':
            return { attack: 2, defense: 2, magic: 1 }; // Uncommon pets have moderate buffs
        case 'rare':
            return { attack: 3, defense: 3, magic: 2 }; // Rare pets have high buffs
        case 'epic':
            return { attack: 4, defense: 4, magic: 3 }; // Epic pets have very high buffs
        case 'legendary':
            return { attack: 5, defense: 5, magic: 4 }; // Legendary pets have max buffs
        default:
            return { attack: 0, defense: 0, magic: 0 }; // No buffs for unknown tiers
    }
};

// Export the Pet model
module.exports = mongoose.model('Pet', PetSchema);
