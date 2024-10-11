const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

// Path to the JSON file for storing warning counts
const warningsFilePath = path.join(__dirname, 'warnings.json');

// Ensure the JSON file exists
if (!fs.existsSync(warningsFilePath)) {
    fs.writeFileSync(warningsFilePath, JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issue a warning to a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guildId = interaction.guild.id;
        const userId = user.id;

        // Load current warnings from the JSON file
        const warningsData = JSON.parse(fs.readFileSync(warningsFilePath));

        // Initialize warning count if the user is not already tracked for this guild
        if (!warningsData[guildId]) {
            warningsData[guildId] = {};
        }
        if (!warningsData[guildId][userId]) {
            warningsData[guildId][userId] = 0;
        }

        // Increment the warning count
        warningsData[guildId][userId]++;
        const currentWarnings = warningsData[guildId][userId];

        // Create an embed message for the warning
        const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('User Warned')
            .addFields(
                { name: 'User', value: `${user}`, inline: true },
                { name: 'Moderator', value: `${interaction.user}`, inline: true },
                { name: 'Reason', value: reason },
                { name: 'Warning Count', value: `${currentWarnings}` }
            )
            .setTimestamp();

        // Send the embed message to the channel
        await interaction.reply({ embeds: [embed] });

        // Send a DM to the warned user
        try {
            await user.send(`You have been warned in **${interaction.guild.name}** for: ${reason}`);
        } catch (error) {
            console.error(`Could not send DM to ${user.tag}:`, error);
            await interaction.followUp({ content: `Could not send a DM to ${user.tag}. They may have DMs disabled.`, ephemeral: true });
        }

        // Look for mod-logs channel
        const modLogsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
        if (modLogsChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('User Warned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})` },
                    { name: 'Moderator', value: `${interaction.user.tag}` },
                    { name: 'Reason', value: reason },
                    { name: 'Warning Count', value: `${currentWarnings}` }
                )
                .setColor(0xffa500)
                .setTimestamp();

            modLogsChannel.send({ embeds: [logEmbed] });
        } else {
            await interaction.channel.send('Mod logs channel not found.');
        }

        // Check if the user has reached 4 warnings
        if (currentWarnings === 3) {
            await interaction.guild.members.kick(user, { reason: `The user received three warnings, and as a result of the final warning, they have been removed from the server.` });

            const kickLogEmbed = new EmbedBuilder()
                .setTitle('User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})` },
                    { name: 'Moderator', value: `${interaction.user.tag}` },
                    { name: 'Reason', value: `The user was warned 3 times and then on the last warning the user was kicked.` }
                )
                .setColor(0xff0000)
                .setTimestamp();

            // Log the kick action
            if (modLogsChannel) {
                modLogsChannel.send({ embeds: [kickLogEmbed] });
            }

            // Remove the user's entry from the JSON file
            delete warningsData[guildId][userId];

            // Check if the guild has no more entries and delete it if empty
            if (Object.keys(warningsData[guildId]).length === 0) {
                delete warningsData[guildId];
            }
        }

        // Save the updated warnings data back to the JSON file
        fs.writeFileSync(warningsFilePath, JSON.stringify(warningsData, null, 2));
    },
};
