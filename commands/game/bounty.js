const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bounty')
        .setDescription('Take on a bounty challenge.'),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) return interaction.reply('You need to start your journey first!');

        const bounty = {
            target: 'Monster A', // Example target
            reward: 200,
            difficulty: 'hard',
            description: 'Defeat Monster A in the dark forest.',
        };

        user.activeBounty = bounty; // Assume activeBounty field in User model
        await user.save();

        interaction.reply(`New bounty accepted: **${bounty.description}**. Reward: ${bounty.reward} coins.`);
    },
};
