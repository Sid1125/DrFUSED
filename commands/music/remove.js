const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a specific song from the queue.')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Position of the song in the queue to remove.')
                .setRequired(true)),
    category: 'music',
    async execute(interaction) {
        const position = interaction.options.getInteger('position');
        const queue = queues.get(interaction.guild.id);

        if (!queue || queue.songs.length < position || position <= 0) {
            return interaction.reply('Invalid position. Please enter a valid song number.');
        }

        const removedSong = queue.songs.splice(position - 1, 1);
        return interaction.reply(`Removed **${removedSong[0].title}** from the queue.`);
    }
}
