const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

// Elements and element weaknesses
const elements = ['Fire', 'Water', 'Earth', 'Air'];
const elementWeakness = {
    Fire: 'Water',
    Water: 'Earth',
    Earth: 'Air',
    Air: 'Fire',
};

// Expanded Monster List
const monsters = [
    { name: 'Goblin', health: 30, reward: 20 },
    { name: 'Skeleton', health: 40, reward: 30 },
    { name: 'Orc', health: 50, reward: 50 },
    { name: 'Troll', health: 70, reward: 70 },
    { name: 'Giant', health: 90, reward: 90 },
    { name: 'Dragon', health: 100, reward: 100 },
    { name: 'Demon Lord', health: 150, reward: 150 },
    { name: 'Shadow Beast', health: 200, reward: 200 },
    { name: 'Minotaur', health: 110, reward: 110 },
    { name: 'Vampire', health: 130, reward: 120 },
    { name: 'Werewolf', health: 120, reward: 110 },
    { name: 'Phoenix', health: 160, reward: 180 },
    { name: 'Lich King', health: 180, reward: 220 },
    { name: 'Kraken', health: 210, reward: 250 },
    { name: 'Leviathan', health: 250, reward: 300 },
    { name: 'Hydra', health: 280, reward: 350 },
    { name: 'Basilisk', health: 300, reward: 380 },
    { name: 'Dark Elf', health: 140, reward: 130 },
    { name: 'Cerberus', health: 190, reward: 170 },
    // Add more monsters if needed
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Engage in a battle with a random monster.'),
    category: 'game',

    async execute(interaction) {
        const userId = interaction.user.id;

        // Check if the user has started their journey
        let user = await User.findOne({ userId });

        if (!user) {
            return interaction.reply('❌ You need to start your journey first! Use /startjourney to begin.');
        }

        if (!user.startedJourney) {
            return interaction.reply('❌ You need to start your journey first! Use /startjourney to begin.');
        }

        if (!user.element) {
            return interaction.reply('❌ You need to choose an element first! Use /startjourney to begin again.');
        }

        await interaction.deferReply();

        // Player health and the randomly selected monster
        const playerHealth = 100; // Example player health
        let playerCurrentHealth = playerHealth;
        const monster = monsters[Math.floor(Math.random() * monsters.length)];
        let monsterCurrentHealth = monster.health;

        // Apply prestige scaling to monster's health
        const difficultyMultiplier = 1 + (user.prestige * 0.3); // Scale based on prestige
        monsterCurrentHealth = Math.round(monster.health * difficultyMultiplier);

        // Check for active battle quest
        let activeQuest = user.dailyQuest === 'Defeat 5 Monsters' || user.dailyQuest === 'Defend the Village';
        let questCompleted = false;

        // Randomly select monster's element
        const monsterElement = elements[Math.floor(Math.random() * elements.length)];

        const battleEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Battle Start!')
            .setDescription(`You are fighting a **${monster.name}**!`)
            .addFields(
                { name: 'Your Health', value: `${playerCurrentHealth}`, inline: true },
                { name: 'Monster Health', value: `${monsterCurrentHealth}`, inline: true }
            );

        await interaction.editReply({ embeds: [battleEmbed] });

        // Battle Loop
        while (monsterCurrentHealth > 0 && playerCurrentHealth > 0) {
            // Player's turn
            const playerAttack = Math.floor(Math.random() * 10) + 5; // Random player attack between 5 and 15

            // Apply element advantage/disadvantage
            if (elementWeakness[user.element] === monsterElement) {
                monsterCurrentHealth -= playerAttack * 1.2; // Extra damage with advantage
            } else {
                monsterCurrentHealth -= playerAttack;
            }

            // Monster's turn
            const monsterAttack = Math.floor(Math.random() * 10) + 5; // Random monster attack
            playerCurrentHealth -= monsterAttack;

            // Update Embed
            battleEmbed.setDescription(`You attacked the **${monster.name}**!`)
                .setFields(
                    { name: 'Your Health', value: `${playerCurrentHealth}`, inline: true },
                    { name: 'Monster Health', value: `${monsterCurrentHealth}`, inline: true }
                );

            await interaction.editReply({ embeds: [battleEmbed] });

            // Check if either the player or the monster has won
            if (monsterCurrentHealth <= 0) {
                const victoryEmbed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle('Victory!')
                    .setDescription(`You have defeated the **${monster.name}**! 🎉`)
                    .addFields(
                        { name: 'Reward', value: `You earned **${Math.floor(monster.reward * difficultyMultiplier)}** coins!` }
                    );

                // Add XP gain to the user after victory
                const xpGained = Math.floor((monster.reward / 2) * difficultyMultiplier); // XP is half the reward amount, scaled with prestige
                user.xp = (user.xp || 0) + xpGained; // Ensure user.xp exists

                // Check if user levels up
                const xpRequiredForLevelUp = user.level * 100;
                if (user.xp >= xpRequiredForLevelUp) {
                    user.level += 1;
                    user.xp = user.xp - xpRequiredForLevelUp; // Reset XP to the remainder after leveling up
                    victoryEmbed.addFields({ name: 'Level Up!', value: `You are now level **${user.level}**!` });
                }

                // Rare chance for a skill point reward (very rare: 1% chance)
                if (Math.random() < 0.01) {
                    user.skillPoints = (user.skillPoints || 0) + 1;
                    victoryEmbed.addFields({ name: 'Bonus!', value: 'You earned **1 Skill Point** from this battle!' });
                }

                // Check and complete the battle quest if applicable
                if (activeQuest) {
                    questCompleted = true; // Set flag for quest completion
                    victoryEmbed.addFields({ name: 'Quest Completed!', value: `You completed the battle quest: **${user.dailyQuest}**!` });
                }

                await user.save();  // Save the updated user information
                victoryEmbed.addFields({ name: 'XP Gained', value: `You gained **${xpGained}** XP!` });

                await interaction.followUp({ embeds: [victoryEmbed] });
                break;
            } else if (playerCurrentHealth <= 0) {
                const defeatEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Defeat!')
                    .setDescription(`You were defeated by the **${monster.name}**. Better luck next time!`)
                    .addFields(
                        { name: 'Your Health', value: '0', inline: true },
                        { name: 'Monster Health', value: `${monsterCurrentHealth}`, inline: true }
                    );

                await interaction.followUp({ embeds: [defeatEmbed] });
                break;
            }
        }

        // If the quest was completed, update user quest status
        if (questCompleted) {
            user.dailyQuest = null; // Reset daily quest after completion
            user.dailyQuestReward = null; // Reset the reward as well
            await user.save(); // Save the updated user information
        }
    },
};