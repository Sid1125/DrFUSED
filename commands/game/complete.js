const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('complete')
        .setDescription('Complete your current quest!'),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;

        try {
            // Check if the user exists
            let user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.followUp('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            // Check if the user has an accepted quest
            if (!user.currentQuest) {
                return interaction.followUp('❌ You do not have any active quests. Use `/accept` to start a quest!');
            }

            const currentQuest = user.currentQuest;

            // Grant rewards to user
            user.coins += currentQuest.reward; // Reward coins
            user.experience += currentQuest.xpReward; // Grant experience

            // Level up logic
            const experienceNeeded = user.level * 100;
            while (user.experience >= experienceNeeded) {
                user.level++;
                user.experience -= experienceNeeded;
            }

            // Mark the quest as completed
            if (!user.completedQuests) user.completedQuests = [];
            user.completedQuests.push(currentQuest.name); // Store quest name
            user.currentQuest = null; // Reset current quest

            await user.save();

            const completeEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Quest Completed!')
                .setDescription(`You have completed the quest: **${currentQuest.name}**!`)
                .addFields(
                    { name: 'Rewards', value: `You earned **${currentQuest.reward}** coins and **${currentQuest.xpReward}** XP!` }
                );

            interaction.followUp({ embeds: [completeEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.followUp('❌ There was an error completing your quest. Please try again later.');
        }
    },
};
