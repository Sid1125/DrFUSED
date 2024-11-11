let boss = null;

// Function to generate a boss
function generateBoss() {
    const bossNames = [
        'Dragon', 
        'Giant Troll', 
        'Dark Wizard', 
        'Vampire Lord', 
        'Ancient Guardian',
        'Hydra', 
        'Lich King', 
        'Demon Lord', 
        'Phoenix', 
        'Shadow Beast'
    ];
    const bossName = bossNames[Math.floor(Math.random() * bossNames.length)];
    
    return {
        name: bossName,
        health: Math.floor(Math.random() * 100) + 250, // Boss health between 250 and 350
        attack: Math.floor(Math.random() * 30) + 30,  // Boss attack between 30 and 60
        rewardCoins: Math.floor(Math.random() * 200) + 100, // Random coins reward (100 to 300)
        rewardXP: Math.floor(Math.random() * 150) + 75, // Random XP reward (75 to 225)
        items: generateRewardItems() // Generate random items as rewards
    };
}

// Function to generate random items for rewards
function generateRewardItems() {
    const items = [
        'Rare Sword', 
        'Magic Potion', 
        'Ancient Shield', 
        'Mystic Amulet', 
        'Elixir of Strength'
    ];
    const itemCount = Math.floor(Math.random() * 2) + 1; // Random count of items (1 to 2)
    return Array.from({ length: itemCount }, () => items[Math.floor(Math.random() * items.length)]);
}

// Function to get the current boss
function getBoss() {
    if (!boss || boss.health <= 0) {
        boss = generateBoss(); // Generate a new boss if none exists or if defeated
    }
    return boss;
}

// Function to generate a monster based on the wave number
function getMonster(wave) {
    const monsterNames = [
        'Goblin', 
        'Skeleton', 
        'Zombie', 
        'Orc', 
        'Vampire', 
        'Werewolf', 
        'Mummy', 
        'Giant Rat', 
        'Bandit', 
        'Elemental'
    ];
    const monsterName = monsterNames[Math.floor(Math.random() * monsterNames.length)];

    return {
        name: monsterName,
        health: Math.floor(wave * 30) + 30, // Health increases with each wave (30, 60, 90...)
        attack: Math.floor(wave * 8) + 6,   // Attack increases with each wave (6, 14, 22...)
        rewardCoins: Math.floor(wave * 10) + 5, // Reward coins increase with wave number
        rewardXP: Math.floor(wave * 15) + 10, // Reward XP increases with wave number
    };
}

module.exports = { getBoss, getMonster };
