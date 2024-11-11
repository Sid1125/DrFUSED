const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('additem')
        .setDescription('Add an item to your inventory.')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item you want to add')
                .setRequired(true)),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const item = interaction.options.getString('item');
        const userId = interaction.user.id;
        try {
            // Check if the user has started their journey
            const user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

        if (!user) {
            user = new User({ userId });
            await user.save();
        }

        user.inventory.push(item); // Add item to inventory
        await user.save();

        interaction.followUp(`Added **${item}** to your inventory!`);
         } catch (error) {
            console.error(error);
            return interaction.reply('❌ There was an error checking your journey status. Please try again later.');
        }
    },
};