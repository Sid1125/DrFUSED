const { EmbedBuilder, PermissionsBitField } = require('discord.js'); // Import PermissionsBitField
const { SlashCommandBuilder } = require("@discordjs/builders");
const WarningAutoMod = require('../../models/warningAutoModSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetautomodwarnings')
        .setDescription('Reset the AutoMod Warnings and unmute the specified user. (ADMIN ONLY COMMAND)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose AutoMod warnings have to be reset')
                .setRequired(true)),
    category: 'moderation',
    
    async execute(interaction) {
        // Check if the user has permission to manage roles
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const userId = user.id; // Get the ID of the user specified in the command
        const guildId = interaction.guild.id; // Get the ID of the guild (server)

        try {
            // Retrieve the warning document for the specified user
            let userWarning = await WarningAutoMod.findOne({ userId, guildId });

            // Check if user warnings exist
            if (!userWarning) {
                await interaction.editReply(`${user.username} has no AutoMod warnings to reset.`);
                return;
            }

            // Reset the warnings to 0
            userWarning.warnings = 0;
            userWarning.lastWarning = new Date(); // Update last warning date to now
            await userWarning.save();

            // Unmute the user if they have a "Muted" role
            const member = await interaction.guild.members.fetch(userId);
            const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
            if (muteRole && member.roles.cache.has(muteRole.id)) {
                await member.roles.remove(muteRole);
                await member.timeout(null);
                await interaction.channel.send(`${user.username} has been unmuted.`);
            } else {
                await member.timeout(null);
                await interaction.channel.send(`${user.username} has been unmuted.`);
            }

            // Send confirmation message
            const confirmationEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('AutoMod Warnings Reset')
                .setDescription(`Successfully reset the AutoMod warnings for ${user.username}.`)
                .setFooter({ text: 'Moderation' })
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmationEmbed] });

            // Log the action in mod logs channel
            const modLogChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs'); // Change 'mod-logs' to your actual log channel name
            if (modLogChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('AutoMod Warning Reset')
                    .setDescription(`${interaction.user.username} has reset AutoMod warnings for ${user.username}.`)
                    .addFields(
                        { name: 'User', value: `${user.username} (${userId})`, inline: true },
                        { name: 'Moderator', value: `${interaction.user.username} (${interaction.user.id})`, inline: true },
                        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'Moderation Log' })
                    .setTimestamp();

                await modLogChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('Error resetting AutoMod warnings:', error);
            await interaction.editReply('An error occurred while trying to reset the warnings. Please try again.');
        }
    },
};
