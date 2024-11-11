const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upgradepet')
        .setDescription('Upgrade your pet using coins and special items.')
        .addStringOption(option =>
            option.setName('pet')
                .setDescription('Select your pet to upgrade')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('levels')
                .setDescription('Number of levels to upgrade')
                .setRequired(true)),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user || !user.startedJourney) {
            return interaction.reply('❌ You need to start your journey first! Use /startjourney to begin.');
        }

        const petName = interaction.options.getString('pet');
        const levelsToUpgrade = interaction.options.getInteger('levels');

        // Find the pet in the user's pets
        const pet = user.pets.find(p => p.name === petName);
        if (!pet) {
            return interaction.reply(`❌ You do not own a pet named **${petName}**.`);
        }

        // Define upgrade costs
        const baseUpgradeCost = 10; // Base cost in coins
        const baseSpecialItemCost = 1; // Number of special items needed per level
        const coinsNeeded = baseUpgradeCost * levelsToUpgrade; // Total coins required
        const specialItemsNeeded = baseSpecialItemCost * levelsToUpgrade; // Total items required

        // Check if user has enough coins and special items
        if (user.coins < coinsNeeded) {
            return interaction.reply(`❌ You do not have enough coins to upgrade your pet. You need **${coinsNeeded} coins**.`);
        }
        
        if (user.specialItems < specialItemsNeeded) {
            return interaction.reply(`❌ You do not have enough special items. You need **${specialItemsNeeded} Special Pet Items**.`);
        }

        // Upgrade the pet
        pet.level += levelsToUpgrade; // Increase pet level
        user.coins -= coinsNeeded; // Deduct coins
        user.specialItems -= specialItemsNeeded; // Deduct special items
        await user.save();

        interaction.reply(`Your pet **${pet.name}** has been upgraded to level **${pet.level}**! You spent **${coinsNeeded} coins** and **${specialItemsNeeded} Special Pet Items**.`);
    },
};
