const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

// Expanded daily quests
const dailyQuests = [
    { name: 'Defeat 5 Monsters', reward: 50, type: 'battle' },
    { name: 'Collect 10 Herbs', reward: 30, type: 'gather' },
    { name: 'Craft 3 Items', reward: 70, type: 'craft' },
    { name: 'Explore the Caves', reward: 60, type: 'explore' },
    { name: 'Defend the Village', reward: 80, type: 'battle' },
    { name: 'Defeat 10 Goblins', reward: 100, type: 'battle' }
];

// Expanded regular quests
const quests = [
    { name: 'Find the Hidden Treasure', reward: 20, xpReward: 10, isCompleted: false, type: 'explore' },
    { name: 'Defeat the Cave Monster', reward: 30, xpReward: 15, isCompleted: false, type: 'battle' },
    { name: 'Rescue the Lost Princess', reward: 50, xpReward: 25, isCompleted: false, type: 'rescue' },
    { name: 'Collect 10 Healing Herbs', reward: 15, xpReward: 10, isCompleted: false, type: 'gather' },
    { name: 'Defend the Village from Bandits', reward: 40, xpReward: 20, isCompleted: false, type: 'battle' },
    { name: 'Gather 5 Magic Dust', reward: 25, xpReward: 15, isCompleted: false, type: 'gather' },
    { name: 'Investigate the Haunted Forest', reward: 35, xpReward: 20, isCompleted: false, type: 'explore' },
    { name: 'Collect 3 Phoenix Feathers', reward: 150, xpReward: 75, isCompleted: false, type: 'gather' },
    { name: 'Craft a Healing Potion', reward: 10, xpReward: 5, isCompleted: false, type: 'craft' },
    { name: 'Deliver a Message to the King', reward: 20, xpReward: 10, isCompleted: false, type: 'deliver' },
    { name: 'Explore the Abandoned Castle', reward: 45, xpReward: 25, isCompleted: false, type: 'explore' },
    { name: 'Collect 5 Diamonds', reward: 200, xpReward: 100, isCompleted: false, type: 'gather' },
    { name: 'Find the Lost Artifact', reward: 80, xpReward: 40, isCompleted: false, type: 'explore' },
    { name: 'Battle the Dark Sorcerer', reward: 120, xpReward: 60, isCompleted: false, type: 'battle' },
    { name: 'Save the Merchant from Thieves', reward: 40, xpReward: 20, isCompleted: false, type: 'rescue' },
    { name: 'Collect Ancient Runes', reward: 55, xpReward: 30, isCompleted: false, type: 'gather' },
    { name: 'Help the Villagers with a Crop Crisis', reward: 30, xpReward: 15, isCompleted: false, type: 'help' },
    { name: 'Discover the Secret of the Ancient Temple', reward: 90, xpReward: 45, isCompleted: false, type: 'explore' },
    { name: 'Defend the Town from Trolls', reward: 100, xpReward: 50, isCompleted: false, type: 'battle' },
    { name: 'Hunt Down the Rogue Wizard', reward: 110, xpReward: 55, isCompleted: false, type: 'battle' }
];

// Expanded boss fight quests
const bossQuests = [
    { name: 'Defeat the Forest Guardian', reward: 200, xpReward: 100, isCompleted: false, type: 'battle' },
    { name: 'Slay the Ice Dragon', reward: 300, xpReward: 150, isCompleted: false, type: 'battle' },
    { name: 'Conquer the Flame Beast', reward: 250, xpReward: 125, isCompleted: false, type: 'battle' },
    { name: 'Vanquish the Shadow Lord', reward: 400, xpReward: 200, isCompleted: false, type: 'battle' },
    { name: 'End the Reign of the Blood Queen', reward: 500, xpReward: 250, isCompleted: false, type: 'battle' },
    { name: 'Defeat the Storm Titan', reward: 600, xpReward: 300, isCompleted: false, type: 'battle' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quests')
        .setDescription('View and accept available quests.'),
    category: 'game',
    quests,
    bossQuests,
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        try {
            // Check if the user has started their journey
            let user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            // Prestige scaling: Multiply quest rewards and XP based on user prestige level
            const prestigeMultiplier = 1 + (user.prestige * 0.2);

            // Assign daily quest if not already assigned
            if (!user.dailyQuest) {
                const selectedQuest = dailyQuests[Math.floor(Math.random() * dailyQuests.length)];
                user.dailyQuest = selectedQuest.name;
                user.dailyQuestReward = Math.floor(selectedQuest.reward * prestigeMultiplier); // Apply scaling
                await user.save();
            }

            // Combine regular and boss quests
            const allQuests = [...quests, ...bossQuests];

            // Apply scaling to all quests
            const scaledQuests = allQuests.map(quest => ({
                ...quest,
                reward: Math.floor(quest.reward * prestigeMultiplier),
                xpReward: Math.floor(quest.xpReward * prestigeMultiplier)
            }));

            // Filter out completed quests
            const availableQuests = scaledQuests.filter(quest => !quest.isCompleted);
            const questList = availableQuests.map((quest, index) => `${index + 1}. **${quest.name}** - Reward: **${quest.reward}** coins`).join('\n');

            // Embed for quests and daily quest
            const questsEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTitle('Available Quests')
                .setDescription(questList)
                .addFields(
                    { name: 'Daily Quest', value: `**${user.dailyQuest}** - Reward: **${user.dailyQuestReward} coins**` },
                    { name: 'Instructions', value: 'Type `/accept <quest_number>` to accept a quest!' }
                );

            interaction.followUp({ embeds: [questsEmbed] });

        } catch (error) {
            console.error(error);
            return interaction.reply('❌ There was an error checking your journey status. Please try again later.');
        }
    },
};
