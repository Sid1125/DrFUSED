const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');
const Pet = require('../../models/Pet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletegamedata')
        .setDescription('Delete all your player data.'),
    category: 'game',
    async execute(interaction) {
        // Confirm the deletion
        const confirmationMessage = await interaction.reply({
            content: 'Are you sure you want to delete all your data? This action cannot be undone. Type "confirm" to proceed.',
            fetchReply: true
        });

        // Create a message collector for the user's response
        const filter = response => response.author.id === interaction.user.id && response.content.toLowerCase() === 'confirm';
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000 }); // 15 seconds to respond

        collector.on('collect', async (message) => {
            // User confirmed deletion
            await User.deleteOne({ userId: interaction.user.id });
            await Pet.deleteMany({ userId: interaction.user.id });

            await interaction.followUp('✅ Your account data has been successfully deleted.');
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('❌ Deletion cancelled. No response received.');
            }
        });
    },
};
