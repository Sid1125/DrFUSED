const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { quests, bossQuests } = require('./quest');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept a quest to begin your adventure!')
        .addIntegerOption(option =>
            option.setName('quest_number')
                .setDescription('The number of the quest you want to accept')
                .setRequired(true)),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const questNumber = interaction.options.getInteger('quest_number') - 1; // Convert to zero-based index
        const userId = interaction.user.id;

        try {
            // Check if the user has started their journey
            let user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.followUp('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            // Combine regular and boss quests
            const allQuests = [...quests, ...bossQuests];

            // Validate quest number
            if (questNumber < 0 || questNumber >= allQuests.length) {
                return interaction.followUp('Invalid quest number. Please try again.');
            }

            const selectedQuest = allQuests[questNumber];

            if (user.currentQuest) {
                return interaction.followUp(`You have already accepted a quest: **${user.currentQuest.name}**. Complete it before accepting another.`);
            }

            user.currentQuest = selectedQuest;

            // Check if the quest is already completed
            if (user.completedQuests && user.completedQuests.includes(selectedQuest.id)) {
                return interaction.followUp(`You have already completed the quest: **${selectedQuest.name}**.`);
            }

            // Mark quest as completed
            if (!user.completedQuests) user.completedQuests = [];
            user.completedQuests.push(selectedQuest.id);

            // Grant rewards to user
            user.coins += selectedQuest.reward; // Reward coins
            user.experience += selectedQuest.xpReward; // Grant experience

            // Level up logic
            const experienceNeeded = user.level * 100;
            while (user.experience >= experienceNeeded) {
                user.level++;
                user.experience -= experienceNeeded;
            }

            await user.save();

            const acceptedEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Quest Accepted!')
                .setDescription(`You have accepted the quest: **${selectedQuest.name}**! Get ready for your adventure!`)
                .addFields(
                    { name: 'Reward', value: `**${selectedQuest.reward}** coins and **${selectedQuest.xpReward}** XP` }
                );

            interaction.followUp({ embeds: [acceptedEmbed] });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                return interaction.followUp('❌ There was an error checking your journey status. Please try again later.');
            }
        }
    },
};
