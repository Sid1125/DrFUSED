const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { shopItems } = require('./shop'); // Ensure you have access to shop items
const { petsData } = require('../../models/Pet'); // Ensure petsData is correctly exported from Pet.js

// Function to get a random pet based on rarity
function getRandomPet() {
    const randomIndex = Math.random();
    
    if (randomIndex < 0.6) { // 60% chance for common
        return petsData.filter(pet => pet.tier === 'common')[Math.floor(Math.random() * 10)];
    } else if (randomIndex < 0.9) { // 30% chance for uncommon
        return petsData.filter(pet => pet.tier === 'uncommon')[Math.floor(Math.random() * 7)];
    } else { // 10% chance for rare
        return petsData.filter(pet => pet.tier === 'rare')[Math.floor(Math.random() * 6)];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setDescription('Claim your daily reward!'),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) return interaction.reply('You need to start your journey first!');

        const now = new Date();
        const lastClaim = user.lastDailyReward ? new Date(user.lastDailyReward) : null;
        const timeDiff = lastClaim ? (now - lastClaim) : 0;

        if (timeDiff < 86400000) return interaction.reply("You already claimed your daily reward today!");

        const streakBonus = Math.min(user.dailyStreak || 1, 7);
        const rewardCoins = 100 + (10 * streakBonus);
        const rewardXP = 50 + (5 * streakBonus);

        // Randomly select an item from shopItems
        const shopItemReward = shopItems[Math.floor(Math.random() * shopItems.length)];

        // Randomly determine if the user receives a pet and which one
        let petReward = null;
        if (Math.random() < 0.3) { // 30% chance to receive a pet
            petReward = getRandomPet();
        }

        user.coins += rewardCoins;
        user.xp += rewardXP;
        user.dailyStreak = streakBonus >= 7 ? 1 : (user.dailyStreak || 1) + 1;
        user.lastDailyReward = now;

        // Add the shop item to the user's inventory
        if (shopItemReward) {
            user.inventory.push({
                id: shopItemReward.id,
                name: shopItemReward.name,
                effectiveness: shopItemReward.effectiveness
            });
        }

        // If a pet was rewarded, add it to the user's inventory
        if (petReward) {
            user.inventory.push({
                id: petReward.name, // Using name as an ID for simplicity
                name: petReward.name,
                type: 'Pet'
            });
        }

        await user.save();

        // Constructing the response message
        const dailyEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle("Daily Reward")
            .setDescription(`You received **${rewardCoins} coins**, **${rewardXP} XP**, and a **${shopItemReward.name}**!`)
            .addFields(
                { name: 'Pet', value: petReward ? `You got a **${petReward.name}**!` : 'No pet this time.', inline: true }
            )
            .setFooter({ text: `Milestone rewards available at day 7 and day 30!` });

        interaction.reply({ embeds: [dailyEmbed] });
    }
};
