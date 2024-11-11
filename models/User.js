const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    skills: { type: Object, default: { attack: 0, defense: 0, magic: 0 } },
    inventory: { type: Array, default: [] },
    completedQuests: { type: Array, default: [] },
    activeQuest: { type: Object, default: null }, // Track active quest and progress
    startedJourney: { type: Boolean, default: false },
    element: { type: String, default: 'Fire' },
    prestige: { type: Number, default: 0 },
    rewardMultiplier: { type: Number, default: 1 },
    difficultyMultiplier: { type: Number, default: 1 },
    xpMultiplier: { type: Number, default: 1 },
    specialItems: { type: Number, default: 0 },
    unlockedRegions: { type: Array, default: [] },
    currentRegion: { type: String, default: null },
    currentSubRegionIndex: { type: Number, default: 0 },
    exploredSubRegions: { type: Array, default: [] },
    lastExplore: { type: Number, default: 0 },
    health: { type: Number, default: 100 },
    xp: { type: Number, default: 0 },
    dailyItem: { type: Object, default: null },
    lastDailyItemId: { type: String, default: null },
    equippedWeapon: { type: Object, default: null },
    equippedArmor: { type: Object, default: null },
    lastDailyReward: { type: Date, default: null },
    skillPoints: { type: Number, default: 0 }
});

// Virtual to calculate max health based on prestige level
UserSchema.virtual('maxHealth').get(function() {
    return 100 + this.prestige * 10;
});

module.exports = mongoose.model('User', UserSchema);
