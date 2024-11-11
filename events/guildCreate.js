const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    once: false, // This event triggers every time the bot joins a server

    async execute(guild) {
        try {
            // Find a channel where the bot can send messages
            const defaultChannel = guild.channels.cache.find(channel => 
                channel.permissionsFor(guild.members.me).has('SendMessages') &&
                channel.type === ChannelType.GuildText // Using ChannelType enum for better readability
            );

            // Check if the "Muted" role already exists
            let mutedRole = guild.roles.cache.find(role => role.name === 'Muted');
            
            // If it doesn't exist, create the role
            if (!mutedRole) {
                mutedRole = await guild.roles.create({
                    name: 'Muted',
                    color: '#FF0000',
                    permissions: [], // Optional: no permissions for the muted role
                    reason: 'Auto-created Muted role for moderation purposes',
                });
                console.log(`Created Muted role in ${guild.name}`);
            } else {
                console.log(`Muted role already exists in ${guild.name}`);
            }

            // Check for existing mod-logs channel
            let modLogsChannel = guild.channels.cache.find(channel => channel.name === 'mod-logs');

            // If the channel does not exist, create it
            if (!modLogsChannel) {
                modLogsChannel = await guild.channels.create({
                    name: 'mod-logs',
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                    reason: 'Auto-created mod-logs channel for logging purposes',
                });
                console.log(`Created mod-logs channel in ${guild.name}`);
            } else {
                console.log(`mod-logs channel already exists in ${guild.name}`);
            }

            // Prepare the embed message
            const embed = new EmbedBuilder()
                .setTitle('Thank you for adding me to your server!')
                .setDescription(
                    `Hello! I'm your new bot. Here are some things you might want to know:\n\n` +
                    `🔧 **Moderation Features**: All moderation actions (bans, kicks, mutes) will be logged in the \`mod-logs\` channel.\n\n` +
                    `⚙️ **Commands**: Use \`/help\` to see all the commands I offer.\n\n` +
                    `If you have any questions or need help, feel free to reach out to <@699257426712592385> !` 
                )
                .setColor(0x00AE86)
                .setTimestamp();

            // Send the greeting message to the default channel
            if (defaultChannel) {
                await defaultChannel.send({ embeds: [embed] });
                await defaultChannel.send(`The mod-logs channel has been created: ${modLogsChannel}`);
            } else {
                console.log(`Could not find a suitable channel in ${guild.name}`);
            }

            console.log(`Joined server: ${guild.name}, found or created mod-logs channel: ${modLogsChannel.name}`);
        } catch (error) {
            console.error(`Error during guildCreate event in ${guild.name}:`, error);
        }
    }
};
