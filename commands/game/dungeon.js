const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Pet = require('../../models/Pet'); // Import the Pet model
const { getMonster } = require('../../models/gameUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dungeon')
        .setDescription('Enter a dungeon and fight waves of monsters.'),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user || !user.startedJourney) return interaction.reply('You need to start your journey first!');

        // Retrieve user's pet if it exists
        let petDamage = 0;
        let petHealth = 0;
        if (user.petId) {
            const pet = await Pet.findById(user.petId); // Fetch the pet using its ID
            if (pet) {
                petDamage = pet.getBuffs().attack; // Get attack buff based on pet tier
                petHealth = pet.health; // Get pet's health
            }
        }

        let playerHealth = 100;
        const waves = 5;
        let rewards = { coins: 0, experience: 0 };

        for (let wave = 1; wave <= waves; wave++) {
            const monster = getMonster(wave);
            let monsterHealth = monster.health;

            const dungeonEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle(`Wave ${wave}`)
                .setDescription(`Fighting **${monster.name}** - HP: ${monsterHealth}`)
                .addFields(
                    { name: 'Your Health', value: `${playerHealth}`, inline: true },
                    { name: 'Monster Health', value: `${monsterHealth}`, inline: true },
                    { name: 'Pet Damage', value: `${petDamage}`, inline: true },
                    { name: 'Pet Health', value: `${petHealth}`, inline: true } // Display pet's health
                );

            await interaction.reply({ embeds: [dungeonEmbed] });

            // Simulate battle
            while (playerHealth > 0 && monsterHealth > 0) {
                // Calculate damage
                const playerDamage = Math.random() * 10; // Random damage to the monster
                const monsterDamage = Math.random() * monster.attack; // Monster attacks back

                // Apply pet's damage if the pet is alive
                if (petHealth > 0) {
                    monsterHealth -= petDamage; // Pet deals damage to the monster
                }

                // Update health
                monsterHealth -= playerDamage;
                playerHealth -= monsterDamage;

                // Update embed with new health values
                dungeonEmbed.setDescription(`Fighting **${monster.name}** - HP: ${monsterHealth}`)
                    .addFields(
                        { name: 'Your Health', value: `${Math.max(0, playerHealth).toFixed(2)}`, inline: true },
                        { name: 'Monster Health', value: `${Math.max(0, monsterHealth).toFixed(2)}`, inline: true },
                        { name: 'Pet Damage', value: `${petDamage}`, inline: true },
                        { name: 'Pet Health', value: `${Math.max(0, petHealth).toFixed(2)}`, inline: true } // Show pet's health status
                    );

                await interaction.editReply({ embeds: [dungeonEmbed] });

                // Delay for readability
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            if (playerHealth <= 0) {
                return interaction.reply("You were defeated! Collect your rewards and try again.");
            }

            rewards.coins += monster.rewardCoins;
            rewards.experience += monster.rewardXP;

            await interaction.followUp(`You defeated the wave! Current rewards: **${rewards.coins} coins** and **${rewards.experience} XP**.`);
        }

        // Update user stats
        user.coins += rewards.coins;
        user.experience += rewards.experience;
        await user.save();

        return interaction.reply("Congratulations! You've cleared the dungeon!");
    }
};
