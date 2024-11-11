const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const petsData = require('./pet')
// Define regions and their sub-regions along with unique monsters
const regions = {
    'Mystic Forest': {
        subRegions: [
            'Enchanted Glade',
            'Whispering Thicket',
            'Dark Hollow',
            'Moonlit Grove',
            'Faerie Glens',
        ],
        monsters: [
            { name: 'Forest Spirit', health: 40 },
            { name: 'Woodland Sprite', health: 25 },
            { name: 'Treant', health: 70 },
            { name: 'Elder Wolf', health: 50 },
            { name: 'Giant Spider', health: 60 },
        ],
    },
    'Crystal Caves': {
        subRegions: [
            'Glimmering Tunnel',
            'Echoing Chamber',
            'Stalactite Cavern',
            'Shimmering Hall',
            'Diamond Depths',
        ],
        monsters: [
            { name: 'Crystal Golem', health: 90 },
            { name: 'Cave Bat', health: 20 },
            { name: 'Rock Elemental', health: 80 },
            { name: 'Lurking Shadow', health: 60 },
            { name: 'Gem Enchanter', health: 70 },
        ],
    },
    'Desert of Illusions': {
        subRegions: [
            'Mirage Oasis',
            'Sandstorm Valley',
            'Hidden Tomb',
            'Whispering Dunes',
            'Lost City Ruins',
        ],
        monsters: [
            { name: 'Sand Serpent', health: 50 },
            { name: 'Phantom Guardian', health: 70 },
            { name: 'Desert Scorpion', health: 40 },
            { name: 'Cursed Mummy', health: 60 },
            { name: 'Illusionist', health: 55 },
        ],
    },
    'Frozen Tundra': {
        subRegions: [
            'Glacier Falls',
            'Frostbitten Cliffs',
            'Snowdrift Plains',
            'Icy Caverns',
            'Northern Lights Valley',
        ],
        monsters: [
            { name: 'Ice Troll', health: 80 },
            { name: 'Frost Elemental', health: 75 },
            { name: 'Snow Leopard', health: 50 },
            { name: 'Wraith of Winter', health: 90 },
            { name: 'Snow Golem', health: 60 },
        ],
    },
    'Volcanic Wasteland': {
        subRegions: [
            'Lava Pits',
            'Ashen Plains',
            'Ember Ridge',
            'Scorched Hollow',
            'Magma Chamber',
        ],
        monsters: [
            { name: 'Fire Elemental', health: 100 },
            { name: 'Magma Beast', health: 90 },
            { name: 'Lava Drake', health: 120 },
            { name: 'Ashen Zombie', health: 70 },
            { name: 'Ember Sprite', health: 40 },
        ],
    },
};

const COOLDOWN_TIME = 30 * 1000; // 30 seconds cooldown for exploration
const TREASURE_COOLDOWN_TIME = 2 * 60 * 1000; // 2 minutes cooldown for treasures and special pet items

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explore a region and find treasures or monsters!'),
    category: 'game',

    async execute(interaction) {
        const userId = interaction.user.id;
        let user = await User.findOne({ userId });
    
        if (!user || !user.startedJourney || !user.element) {
            return interaction.reply('❌ You need to start your journey first and choose an element!');
        }
    
        // Ensure unlocked regions array is initialized
        if (!user.unlockedRegions || user.unlockedRegions.length === 0) {
            const firstRegion = Object.keys(regions)[Math.floor(Math.random() * Object.keys(regions).length)];
            user.unlockedRegions = [firstRegion];  // Initialize unlocked regions
            user.currentRegion = firstRegion;      // Set the first region as the current one
            user.currentSubRegionIndex = 0;
            user.exploredSubRegions = [];
            await user.save();
        }
    
        const selectedRegion = user.currentRegion;
        const selectedSubRegion = regions[selectedRegion].subRegions[user.currentSubRegionIndex];
    
        // Handle the general exploration cooldown
        const currentTime = Date.now();
        if (user.lastExplore && (currentTime - user.lastExplore < COOLDOWN_TIME)) {
            const timeLeft = ((COOLDOWN_TIME - (currentTime - user.lastExplore)) / 1000).toFixed(0);
            return interaction.reply(`❌ You need to wait ${timeLeft} seconds before exploring again!`);
        }
        user.lastExplore = currentTime; // Update last explore time
    
        const encounterChance = Math.random();
        const responseEmbed = new EmbedBuilder();
    
        // Handle treasure/pet item cooldown logic
        if (user.lastTreasure && (currentTime - user.lastTreasure < TREASURE_COOLDOWN_TIME)) {
            const timeLeft = ((TREASURE_COOLDOWN_TIME - (currentTime - user.lastTreasure)) / 1000).toFixed(0);
            responseEmbed.setFooter({ text: `You cannot find any more treasures or pet items for another ${timeLeft} seconds.` });
        }
    
        // Check for pet discovery (1-2% chance)
        const petDiscoveryChance = Math.random();
        if (petDiscoveryChance < 0.02) { // 2% chance to find a pet
            const foundPet = petsData[Math.floor(Math.random() * petsData.length)];
            responseEmbed
                .setColor(0x00FF00)
                .setTitle('You Found a Pet!')
                .setDescription(`You discovered a new pet: **${foundPet.name}**!`)
                .addFields({ name: 'Type', value: foundPet.type, inline: true })
                .addFields({ name: 'Level', value: `${foundPet.level}`, inline: true });
    
            // Save the pet to the user's collection
            const pet = new Pet({ userId: userId, name: foundPet.name, level: foundPet.level, type: foundPet.type });
            await pet.save();
            responseEmbed.addFields({ name: 'Adoption', value: 'You have adopted this pet!', inline: false });
        } else if (encounterChance < 0.2) {
            responseEmbed
                .setColor(0x808080)
                .setTitle('No New Discoveries!')
                .setDescription(`You explored **${selectedSubRegion}** but found nothing new.`);
        } else {
            const uniqueMonsters = regions[selectedRegion].monsters;
            const alreadyExploredMonsters = user.exploredSubRegions.filter(subRegion => subRegion === selectedSubRegion).length;
    
            if (alreadyExploredMonsters >= uniqueMonsters.length) {
                responseEmbed
                    .setColor(0xFFD700)
                    .setTitle('Sub-region Completed!')
                    .setDescription(`You have explored all the monsters in **${selectedSubRegion}**. Moving to the next sub-region...`);
    
                user.currentSubRegionIndex++;
                if (user.currentSubRegionIndex >= regions[selectedRegion].subRegions.length) {
                    // Move to a new random region when all sub-regions are completed
                    let availableRegions = Object.keys(regions).filter(r => !user.unlockedRegions.includes(r));
                    if (availableRegions.length === 0) {
                        availableRegions = Object.keys(regions); // If all regions are unlocked, restart
                    }
                    user.currentRegion = availableRegions[Math.floor(Math.random() * availableRegions.length)];
                    user.unlockedRegions.push(user.currentRegion); // Unlock the new region
                    user.currentSubRegionIndex = 0;
                    user.exploredSubRegions = [];
                    responseEmbed.setDescription(`You have now moved to a new region: **${user.currentRegion}**!`);
                }
            } else {
                const monster = uniqueMonsters[Math.floor(Math.random() * uniqueMonsters.length)];
                const difficultyMultiplier = 1 + (user.prestige * 0.3);
                const monsterCurrentHealth = Math.round(monster.health * difficultyMultiplier);
    
                user.exploredSubRegions.push(selectedSubRegion);
    
                // 50/50 chance to either kill the monster or escape with health cost
                const battleOutcome = Math.random() < 0.5;
    
                if (battleOutcome) {
                    // Monster defeated
                    const xpGain = Math.floor(Math.random() * 6) + 5; // Random XP between 5 and 10
                    user.xp = (user.xp || 0) + xpGain; // Update user's XP
                    responseEmbed
                        .setColor(0x00AE86)
                        .setTitle('Victory!')
                        .setDescription(`You encountered a wild **${monster.name}** in **${selectedSubRegion}** and successfully defeated it!`)
                        .addFields({ name: 'XP Earned', value: `${xpGain} XP` });
    
                    // Check for rare item or coin drop
                    if (Math.random() < 0.05) { // 5% chance for a drop
                        const foundItem = Math.random() < 0.5 ? 'a rare item' : 'some coins';
                        responseEmbed.addFields({ name: 'Loot Found!', value: `You found **${foundItem}**!` });
                        user.coins = (user.coins || 0) + (foundItem === 'some coins' ? Math.floor(Math.random() * 50) + 10 : 0); // Add coins if applicable
                    }
                } else {
                    // User escapes with health cost
                    // Check if user health is a number and initialize if necessary
                    if (typeof user.health !== 'number') {
                        user.health = 100; // Set to a default value if needed
                    }
                    const activeQuest = user.quests.find(quest => quest.type === 'explore' && quest.isActive);
                    if (activeQuest) {
                        activeQuest.progress += 1; // Update quest progress
                        if (activeQuest.progress >= activeQuest.target) {
                            activeQuest.isActive = false; // Complete the quest
                            activeQuest.completed = true; // Mark as completed
                            responseEmbed.setFooter({ text: `🎉 You have completed the quest "${activeQuest.name}" by exploring!` });
                        } else {
                            responseEmbed.setFooter({ text: `Progress on your quest "${activeQuest.name}": ${activeQuest.progress}/${activeQuest.target}.` });
                        }
                    }
                    // User escapes with health cost
                    const healthCost = Math.floor(user.health * 0.2); // Calculate 20% of user's current health
                    user.health = Math.max(0, user.health - healthCost); // Prevent health from going below zero
                    responseEmbed
                        .setColor(0xFF0000)
                        .setTitle('You Escaped!')
                        .setDescription(`You encountered a wild **${monster.name}** in **${selectedSubRegion}** but had to escape, losing **${healthCost}** health in the process.`);
                }
            }
        }
    
        if (encounterChance > 0.8 && (!user.lastTreasure || (currentTime - user.lastTreasure >= TREASURE_COOLDOWN_TIME))) {
            let foundItem;
            const itemChance = Math.random();
            
            if (itemChance < 0.5) {
                // Consumable Item
                foundItem = 'Healing Potion';
                responseEmbed.addFields({ name: 'Special Find!', value: `You discovered a **${foundItem}** that restores 20% of your health!` });
                user.health = Math.min(user.health + 20, 100); // Restore health, max at 100
            } else if (itemChance < 0.8) {
                // Equipment
                foundItem = 'Mystic Amulet';
                responseEmbed.addFields({ name: 'Special Find!', value: `You discovered a **${foundItem}** that increases your damage by 10%!` });
                user.damageBoost = (user.damageBoost || 0) + 10; // Apply damage boost
            } else {
                // Crafting Material
                foundItem = 'Crystal';
                responseEmbed.addFields({ name: 'Special Find!', value: `You discovered a **${foundItem}** that can be used for crafting!` });
                user.crystals = (user.crystals || 0) + 1; // Increment crystals
            }
        
            user.lastTreasure = currentTime; // Start the treasure cooldown
        }
    
        await user.save();
        await interaction.reply({ embeds: [responseEmbed] });
    }
};    