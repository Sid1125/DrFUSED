const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');
const Pet = require('../../models/Pet');

// Define pet tiers and their counts
const petsData = [
    { name: 'Fluffy', level: 1, type: 'attack', tier: 'common' },
    { name: 'Shadow', level: 1, type: 'defense', tier: 'common' },
    { name: 'Fang', level: 1, type: 'attack', tier: 'common' },
    { name: 'Whiskers', level: 1, type: 'attack', tier: 'common' },
    { name: 'Rover', level: 1, type: 'attack', tier: 'common' },
    { name: 'Bruno', level: 1, type: 'attack', tier: 'common' },
    { name: 'Ninja', level: 1, type: 'attack', tier: 'common' },
    { name: 'Max', level: 1, type: 'attack', tier: 'common' },
    { name: 'Pepper', level: 1, type: 'attack', tier: 'common' },
    { name: 'Roxy', level: 1, type: 'attack', tier: 'common' },
    { name: 'Thor', level: 1, type: 'attack', tier: 'common' },
    { name: 'Ginger', level: 1, type: 'attack', tier: 'common' },
    { name: 'Spike', level: 1, type: 'attack', tier: 'common' },
    { name: 'Bella', level: 1, type: 'defense', tier: 'common' },
    { name: 'Daisy', level: 1, type: 'support', tier: 'common' },
    { name: 'Coco', level: 1, type: 'support', tier: 'common' },
    
    { name: 'Spark', level: 1, type: 'magic', tier: 'uncommon' },
    { name: 'Bubbles', level: 1, type: 'support', tier: 'uncommon' },
    { name: 'Storm', level: 1, type: 'magic', tier: 'uncommon' },
    { name: 'Glimmer', level: 1, type: 'support', tier: 'uncommon' },
    { name: 'Sparrow', level: 1, type: 'magic', tier: 'uncommon' },
    { name: 'Luna', level: 1, type: 'magic', tier: 'uncommon' },
    { name: 'Rusty', level: 1, type: 'defense', tier: 'uncommon' },
    { name: 'Fido', level: 1, type: 'defense', tier: 'uncommon' },
    { name: 'Mittens', level: 1, type: 'defense', tier: 'uncommon' },
    { name: 'Duke', level: 1, type: 'defense', tier: 'uncommon' },
    { name: 'Ziggy', level: 1, type: 'magic', tier: 'uncommon' },
    { name: 'Socks', level: 1, type: 'support', tier: 'uncommon' },
    
    { name: 'Rocky', level: 1, type: 'defense', tier: 'rare' },
    { name: 'Teddy', level: 1, type: 'magic', tier: 'rare' },
    { name: 'Chester', level: 1, type: 'support', tier: 'rare' },
    { name: 'Gizmo', level: 1, type: 'support', tier: 'rare' },
    { name: 'Rascal', level: 1, type: 'attack', tier: 'rare' },
    { name: 'Fleur', level: 1, type: 'support', tier: 'rare' },
    
    { name: 'Zeus', level: 1, type: 'magic', tier: 'epic' },
    { name: 'Thor', level: 1, type: 'attack', tier: 'epic' },
    { name: 'Panda', level: 1, type: 'support', tier: 'epic' },
    { name: 'Bella', level: 1, type: 'defense', tier: 'epic' },
    { name: 'Ginger', level: 1, type: 'attack', tier: 'epic' },
    { name: 'Spike', level: 1, type: 'attack', tier: 'epic' },

    { name: 'Fido', level: 1, type: 'defense', tier: 'legendary' },
    { name: 'Ninja', level: 1, type: 'attack', tier: 'legendary' },
    { name: 'Daisy', level: 1, type: 'support', tier: 'legendary' },
    { name: 'Coco', level: 1, type: 'support', tier: 'legendary' },
];

// Add items with tier distribution and effects
const petItems = [
    { name: 'Pet Treat', effect: 'Increases happiness of your pet, boosting attack for 10 minutes.', type: 'Item' },
    { name: 'Pet Armor', effect: 'Protects your pet, reducing damage taken by 20% for 10 minutes.', type: 'Armor' },
    { name: 'Pet Potion', effect: 'Heals your pet for 20 HP.', type: 'Potion' },
    // Add more pet items as needed
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Manage your pets.')
        .addStringOption(option => 
            option.setName('action')
                .setDescription('Action to perform (adopt/train/use)')
                .setRequired(true)
                .addChoices(
                    { name: 'Adopt', value: 'adopt' },
                    { name: 'Train', value: 'train' },
                    { name: 'Use Item', value: 'use' }
                )),
    category: 'game',
    petItems,
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user || !user.startedJourney) return interaction.reply('You need to start your journey first!');

        const action = interaction.options.getString('action');

        if (action === 'adopt') {
            const adoptionCost = 50; // Cost to adopt a pet
            const adoptionChance = Math.random(); // Chance of successfully adopting a pet (0 to 1)

            // Check if the user has enough coins
            if (user.coins < adoptionCost) {
                return interaction.reply('❌ You do not have enough coins to adopt a pet. You need at least 50 coins.');
            }

            // Check for successful adoption
            if (adoptionChance < 0.7) { // 70% chance of adopting successfully
                const newPet = petsData[Math.floor(Math.random() * petsData.length)]; // Randomly select a pet
                const pet = new Pet({ userId: user.userId, name: newPet.name, level: newPet.level, type: newPet.type, tier: newPet.tier });
                await pet.save();
                user.coins -= adoptionCost; // Deduct the adoption cost
                await user.save();
                return interaction.reply(`You have adopted a new pet: **${newPet.name}**! It is a **${newPet.tier}** pet, and you spent **${adoptionCost} coins**.`);
            } else {
                return interaction.reply('❌ No pets were interested in being adopted this time. Please try again later.');
            }
        }

        if (action === 'train') {
            const pets = await Pet.find({ userId: user.userId });
            if (!pets || pets.length === 0) {
                return interaction.reply('You have no pets to train.');
            }
        
            // Select a random pet from the user's pets
            const petToTrain = pets[Math.floor(Math.random() * pets.length)];
        
            // Define base cost and increments
            const baseTrainingCost = 20; // Base cost in coins
            const incrementPerLevel = 5; // Cost increase per pet level
            const incrementPerPrestige = 2; // Cost increase per prestige level
        
            // Calculate the training cost based on the pet's level and user's prestige
            const trainingCost = baseTrainingCost + (incrementPerLevel * (petToTrain.level - 1)) + (incrementPerPrestige * user.prestige);
        
            // Check if the user has enough coins
            if (user.coins < trainingCost) {
                return interaction.reply(`❌ You do not have enough coins to train **${petToTrain.name}**. You need at least **${trainingCost} coins**.`);
            }
        
            // Train the pet (increase level)
            petToTrain.level += 1;
            await petToTrain.save();
            user.coins -= trainingCost; // Deduct the training cost
            await user.save();
            return interaction.reply(`✅ You have trained **${petToTrain.name}** to level **${petToTrain.level}**! You spent **${trainingCost} coins**.`);
        }

        if (action === 'use') {
            const itemName = interaction.options.getString('item');
            const pets = await Pet.find({ userId: user.userId });

            if (!pets || pets.length === 0) {
                return interaction.reply('You have no pets to use items on.');
            }

            // Check if the item exists
            const item = petItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
            if (!item) {
                return interaction.reply('❌ That item does not exist. Please check your spelling and try again.');
            }

            // Use the item on a random pet
            const petToUseItem = pets[Math.floor(Math.random() * pets.length)];

            // Apply item effects
            if (item.type === 'Item') {
                // Buff effect
                return interaction.reply(`You used **${item.name}** on **${petToUseItem.name}**! ${item.effect}`);
            } else if (item.type === 'Armor') {
                // Defensive effect
                return interaction.reply(`You equipped **${item.name}** on **${petToUseItem.name}**! ${item.effect}`);
            } else if (item.type === 'Potion') {
                // Healing effect
                return interaction.reply(`You used **${item.name}** on **${petToUseItem.name}**! ${item.effect}`);
            }

            return interaction.reply('❌ Failed to use the item on your pet.');
        }
    },
};
