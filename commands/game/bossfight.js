const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Pet = require('../../models/Pet'); // Assuming you have a Pet model
const Party = require('../../models/Party'); // Assuming you have a Party model
const { getBoss } = require('../../models/gameUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bossfight')
        .setDescription('Fight a global boss with your party!'),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) return interaction.reply('You need to start your journey first!');

        const party = await Party.findOne({ code: user.partyCode });
        if (!party || party.members.length < 2) {
            return interaction.reply('You need to be in a party with at least 2 players to fight the boss!');
        }

        // Fetch the player's pet (if they have one)
        const pet = await Pet.findOne({ userId: user.userId });
        if (!pet) return interaction.reply('You need a pet to participate in the boss fight!');

        const boss = getBoss(); // Assume this fetches a shared boss instance
        let playerHealth = 100;
        let petHealth = pet.health; // Use pet's health from the model

        const players = party.members; // Get all members in the party

        const bossEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`Boss Fight: ${boss.name}`)
            .setDescription(`Current Boss HP: ${boss.health}\nPlayers: ${players.map(id => `<@${id}>`).join(', ')}`)
            .addFields(
                { name: 'Your Health', value: `${playerHealth}`, inline: true },
                { name: 'Your Pet Health', value: `${petHealth}`, inline: true }
            );

        await interaction.reply({ embeds: [bossEmbed] });

        // Boss fight loop
        while (boss.health > 0 && playerHealth > 0 && petHealth > 0) {
            // Each player attacks the boss
            for (const playerId of players) {
                const playerUser = await User.findOne({ userId: playerId });
                if (playerUser) {
                    const playerDamage = Math.random() * 15; // Player attack
                    boss.health -= playerDamage;

                    // Calculate pet's damage using getBuffs
                    const petDamage = pet.getBuffs().attack + (Math.random() * 10); // Pet attack with buffs
                    boss.health -= petDamage;

                    // Display updated boss health
                    bossEmbed.setDescription(`Current Boss HP: ${boss.health.toFixed(2)}\nPlayers: ${players.map(id => `<@${id}>`).join(', ')}`);

                    // Check if boss is defeated
                    if (boss.health <= 0) {
                        await interaction.followUp("You all contributed to defeating the boss! Rewards will be distributed.");
                        playerUser.coins += 500; // Example reward for the user
                        await playerUser.save();
                        break;
                    }
                }
            }

            // Boss attacks each player
            for (const playerId of players) {
                const playerUser = await User.findOne({ userId: playerId });
                if (playerUser) {
                    const damageTaken = Math.random() * boss.attack; // Boss attack
                    playerHealth -= damageTaken;

                    // Check if the player is defeated
                    if (playerHealth <= 0) {
                        await interaction.followUp(`❌ <@${playerId}> was defeated in the boss fight.`);
                        break;
                    }
                }
            }

            // Pet health management
            petHealth -= Math.random() * 5; // Pet takes some damage (optional)

            // Update the embed with new health values
            bossEmbed.setFields(
                { name: 'Your Health', value: `${playerHealth.toFixed(2)}`, inline: true },
                { name: 'Your Pet Health', value: `${petHealth.toFixed(2)}`, inline: true }
            );

            await interaction.editReply({ embeds: [bossEmbed] });
        }

        // Final checks for player defeat
        if (playerHealth <= 0) {
            await interaction.followUp("You were defeated in the boss fight.");
        }
    }
};
