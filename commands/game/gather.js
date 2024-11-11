const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

const cooldowns = new Map(); // Map to hold cooldowns

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gather')
        .setDescription('Gather materials for crafting.'),
    category: 'game',

    async execute(interaction) {
        // Check for cooldown
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownAmount = 30000; // 30 seconds in milliseconds

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000; // Convert to seconds
                return interaction.reply(`Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`);
            }
        }

        // Set the cooldown for the user
        cooldowns.set(userId, now);

        // Defer the reply to give yourself time to process
        await interaction.deferReply(); // Ensure this is awaited

        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) {
            return interaction.editReply('You need to start your journey first!'); // Edit the deferred reply
        }

        // Define materials and their probabilities
        const materials = [
            { name: 'Wood', type: 'material', probability: 0.5 },
            { name: 'Stone', type: 'material', probability: 0.3 },
            { name: 'Herb', type: 'material', probability: 0.2 },
        ];

        // Gather material based on defined probabilities
        const gatheredMaterial = getRandomMaterial(materials);

        // Update user inventory
        user.inventory.push(gatheredMaterial);

        // Check if there is a current quest for gathering materials
        if (user.currentQuest && user.currentQuest.type === 'gather') {
            user.currentQuest.progress += 1; // Update quest progress

            let responseMessage = `You have successfully gathered **${gatheredMaterial.name}**!`; // Default response
            
            if (user.currentQuest.progress >= user.currentQuest.target) {
                user.currentQuest.isActive = false; // Complete the quest
                user.currentQuest.completed = true; // Mark as completed
                responseMessage = `🎉 You have completed the quest "${user.currentQuest.name}" by gathering **${gatheredMaterial.name}**!`;
            } else {
                responseMessage = `You have successfully gathered **${gatheredMaterial.name}**. Progress on your quest "${user.currentQuest.name}": ${user.currentQuest.progress}/${user.currentQuest.target}.`;
            }

            await user.save(); // Save user data once after all updates

            // Create response embed
            const gatherEmbed = new EmbedBuilder()
                .setTitle('Material Gathered!')
                .setColor(0x00AE86)
                .setDescription(responseMessage)
                .addFields(
                    { name: 'Material Type', value: gatheredMaterial.type, inline: true }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [gatherEmbed] }); // Edit the deferred reply with the embed
        } else {
            // If there's no active gathering quest, just notify the user
            await user.save(); // Save user inventory update
            
            const gatherEmbed = new EmbedBuilder()
                .setTitle('Material Gathered!')
                .setColor(0x00AE86)
                .setDescription(`You have successfully gathered **${gatheredMaterial.name}**, but you don't have an active gathering quest.`);
            
            return interaction.editReply({ embeds: [gatherEmbed] }); // Edit the deferred reply with the embed
        }
    },
};

// Function to randomly select a material based on its probability
function getRandomMaterial(materials) {
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const material of materials) {
        cumulativeProbability += material.probability;
        if (rand < cumulativeProbability) {
            return { name: material.name, type: material.type };
        }
    }

    // Default to the last material if none were selected (shouldn't happen with proper probabilities)
    return materials[materials.length - 1];
}
