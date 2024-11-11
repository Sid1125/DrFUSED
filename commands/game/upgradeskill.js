const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');
const skillTree = require('./skills').skillTree; // Import the skill tree from the `/skills` command

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upgradeskill')
        .setDescription('Upgrade a skill.')
        .addStringOption(option =>
            option.setName('skill')
                .setDescription('The skill you want to upgrade (atk, def, mag)')
                .setRequired(true)),
    category: 'game',

    async execute(interaction) {
        await interaction.deferReply();

        const skillName = interaction.options.getString('skill').toLowerCase(); // Expecting 'atk', 'def', 'mag'
        const userId = interaction.user.id;
        
        try {
            const user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            // Check if the skill exists in the skill tree
            if (!skillTree[skillName]) {
                return interaction.followUp('Invalid skill name. Choose either atk, def, or mag.');
            }

            const currentLevel = user.skills[skillName] || 1;
            const maxLevel = 25;

            // Check if the skill is already maxed out
            if (currentLevel >= maxLevel) {
                return interaction.followUp(`❌ You have already mastered the ${skillTree[skillName].name} skill.`);
            }

            // Calculate the skill point cost based on current level (cost increases every 5 levels)
            const skillPointCost = Math.floor((currentLevel - 1) / 5) + 1;

            if (user.skillPoints < skillPointCost) {
                return interaction.followUp(`❌ You need ${skillPointCost} skill points to upgrade ${skillTree[skillName].name}, but you only have ${user.skillPoints}.`);
            }

            // Upgrade the skill and deduct skill points
            user.skills[skillName] = currentLevel + 1;
            user.skillPoints -= skillPointCost;
            await user.save();

            // Determine the current description based on the new level
            const skillDescriptionIndex = Math.floor((user.skills[skillName] - 1) / 5);
            const skillDescription = skillTree[skillName].descriptions[skillDescriptionIndex];

            return interaction.followUp(`🎉 You have successfully upgraded your ${skillTree[skillName].name} skill to level **${user.skills[skillName]}**! ${skillDescription}`);
        
        } catch (error) {
            console.error(error);
            return interaction.reply('❌ There was an error processing your request. Please try again later.');
        }
    },
};
