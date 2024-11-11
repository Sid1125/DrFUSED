const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const User = require('../../models/User');  // Import the user model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startjourney')
        .setDescription('Start your gaming journey. Without this, you cannot play any games.'),
    category: 'game',
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Check if the user already exists
            let user = await User.findOne({ userId });

            if (user && user.startedJourney) {
                return interaction.reply('You have already started your journey! 🎮');
            }

            if (!user) {
                // Create a new user in the database
                user = new User({ userId, startedJourney: true });
            } else {
                // Update the user's journey status
                user.startedJourney = true;
            }

            // Create a select menu for the element choice
            const elementSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('element_select')
                .setPlaceholder('Choose your element')
                .addOptions([
                    { label: 'Fire', value: 'Fire' },
                    { label: 'Water', value: 'Water' },
                    { label: 'Earth', value: 'Earth' },
                    { label: 'Air', value: 'Air' },
                ]);

            const row = new ActionRowBuilder().addComponents(elementSelectMenu);

            await interaction.reply({
                content: 'Choose your element to begin your journey!',
                components: [row],
            });

            // Update user in the database
            await user.save();
        } catch (error) {
            console.error(error);
            return interaction.reply('There was an error starting your journey. Please try again later.');
        }
    },
};
