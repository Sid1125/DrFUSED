const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Temporarily ban a user.')
        .addUserOption(option => option.setName('target').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Ban duration (e.g., 1d, 1h)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setRequired(false)),
    category: 'moderation',
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) return interaction.reply('User not found in this server.');

        const durationMs = ms(duration);
        if (!durationMs) return interaction.reply('Invalid duration format.');

        await member.ban({ reason });
        interaction.reply(`${target.username} has been banned for ${duration} with reason: ${reason}`);

        setTimeout(async () => {
            await interaction.guild.members.unban(target.id);
            interaction.followUp(`${target.username} has been unbanned after ${duration}.`);
        }, durationMs);
    },
};
