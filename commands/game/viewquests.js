const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { quests, bossQuests } = require('./quest');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewquests')
        .setDescription('View available quests by type.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of quest (e.g., explore, gather, battle, etc.)')
                .setRequired(true)),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const questType = interaction.options.getString('type').toLowerCase();

        try {
            // Check if the user has started their journey
            let user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            // Combine regular and boss quests
            const allQuests = [...quests, ...bossQuests];

            // Filter quests by type
            const filteredQuests = allQuests.filter(quest => quest.type === questType && !quest.isCompleted);

            if (filteredQuests.length === 0) {
                return interaction.followUp(`❌ No available quests found of type: **${questType}**.`);
            }

            const questList = filteredQuests.map((quest, index) => `${index + 1}. **${quest.name}** - Reward: **${quest.reward}** coins`).join('\n');

            // Embed for filtered quests
            const questsEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTitle(`Available Quests of Type: ${questType}`)
                .setDescription(questList)
                .addFields(
                    { name: 'Instructions', value: 'Type `/accept <quest_number>` to accept a quest!' }
                );

            interaction.followUp({ embeds: [questsEmbed] });

        } catch (error) {
            console.error(error);
            return interaction.reply('❌ There was an error checking your journey status. Please try again later.');
        }
    },
};
