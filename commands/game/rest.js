const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rest')
        .setDescription('Rest to recover health.'),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) return interaction.reply('You need to start your journey first!');

        const recoveryAmount = 20; // Amount to recover
        user.health += recoveryAmount; // Assume health property exists
        await user.save();

        interaction.reply(`You have rested and recovered **${recoveryAmount}** health!`);
    },
};
