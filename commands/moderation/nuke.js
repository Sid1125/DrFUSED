const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Deletes and recreates a text channel (nuke)')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to nuke (leave blank for current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Permission required to use this command
    category: 'moderation',
    async execute(interaction) {
        // Check if the user has permission to manage channels
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'You do not have permission to nuke this channel!', ephemeral: true });
        }

        const specifiedChannel = interaction.options.getChannel('channel');
        const channelToNuke = specifiedChannel || interaction.channel; // Use specified channel or fallback to current channel

        // Create the confirmation buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_nuke')
                    .setLabel('Confirm Nuke')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_nuke')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary),
            );

        // Send confirmation prompt
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Nuke Confirmation')
            .setDescription(`Are you sure you want to nuke the channel **${channelToNuke.name}**? This action cannot be undone!`);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        // Create a message collector to handle button interactions
        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 }); // 15 seconds to respond

        collector.on('collect', async i => {
            if (i.customId === 'confirm_nuke') {
                // Nuke the channel
                await i.reply({ content: 'Nuking this channel...', ephemeral: true });

                try {
                    const newChannel = await channelToNuke.clone(); // Clone the current channel
                    await channelToNuke.delete(); // Delete the original channel

                    newChannel.send('💣 This channel has been nuked!');

                    // Logging the action in a specific log channel
                    const logChannel = newChannel.guild.channels.cache.find(ch => ch.name === 'mod-logs');
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Channel Nuked')
                            .setDescription(`Channel **${newChannel.name}** was nuked by ${interaction.user.tag}`)
                            .setTimestamp();
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                } catch (error) {
                    console.error(error);
                    i.followUp({ content: 'An error occurred while nuking the channel.', ephemeral: true });
                }

                collector.stop(); // Stop the collector after the action is confirmed
            } else if (i.customId === 'cancel_nuke') {
                await i.reply({ content: 'Nuke operation cancelled.', ephemeral: true });
                collector.stop(); // Stop the collector when cancelled
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'Nuke confirmation timed out.', ephemeral: true });
            }
        });
    },
};
