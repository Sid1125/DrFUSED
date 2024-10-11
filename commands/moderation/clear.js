const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk delete messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply('You can only delete between 1 and 100 messages.');
        }

        // Ensure the command is being run in a text channel
        if (interaction.channel.type !== ChannelType.GuildText) {
            return interaction.reply('This command can only be used in a text channel.');
        }

        try {
            // Bulk delete messages
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply(`Successfully deleted ${deletedMessages.size} messages.`);

            // Look for mod-logs channel
            const modLogsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (modLogsChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('Messages Cleared')
                    .addFields(
                        { name: 'Moderator', value: `${interaction.user.tag}` },
                        { name: 'Amount', value: `${deletedMessages.size} messages` },
                        { name: 'Channel', value: `${interaction.channel.name}` }
                    )
                    .setColor(0xffa500)
                    .setTimestamp();

                await modLogsChannel.send({ embeds: [embed] });
            } else {
                await interaction.followUp('Mod logs channel not found.');
            }
        } catch (error) {
            console.error('Error while deleting messages:', error);
            await interaction.reply('An error occurred while trying to clear messages. Please try again.');
        }
    },
};
