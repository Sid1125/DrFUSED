const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prestige')
        .setDescription('Reset your progress for special bonuses and increased difficulty.'),
    category: 'game',
    async execute(interaction) {
        try {
            const user = await User.findOne({ userId: interaction.user.id });

            if (!user) {
                return interaction.reply('❌ You have not started your journey yet! Use `/startjourney` to begin.');
            }

            if (user.level >= 50) {
                user.prestige += 1; // Increase prestige count
                user.level = 1; // Reset level
                user.coins = 0; // Reset coins
                user.skills = { attack: 0, defense: 0, magic: 0 }; // Reset skills
                user.inventory = []; // Optionally reset inventory as well

                // Set scaling multipliers
                user.rewardMultiplier = 1 + (user.prestige * 0.2);
                user.difficultyMultiplier = 1 + (user.prestige * 0.3);
                user.xpMultiplier = 1 + (user.prestige * 0.2);

                await user.save();

                await interaction.reply(`🎉 Congrats! You have reached Prestige **${user.prestige}**. Your progress has been reset, and the game is now more challenging!`);
            } else {
                await interaction.reply('❌ You need to be at least level 50 to prestige.');
            }

        } catch (error) {
            console.error('Error processing prestige command:', error);
            await interaction.reply('❌ An error occurred while trying to prestige. Please try again later.');
        }
    }
};
