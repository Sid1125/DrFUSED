const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues, playSong } = require('./play');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('Skips to a specific song in the queue.')
        .addIntegerOption(option => 
            option.setName('position')
                .setDescription('Position of the song in the queue to skip to.')
                .setRequired(true)),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply(); // Defer the reply

        const queue = queues.get(interaction.guild.id);
        const position = interaction.options.getInteger('position');

        if (!queue || queue.songs.length < position || position <= 0) {
            return interaction.followUp({ content: 'Invalid position. Please enter a valid song number.', ephemeral: true });
        }

        queue.songs = queue.songs.slice(position - 1);
        playSong(queue, interaction);
        return interaction.followUp({ content: `Skipped to song number ${position}.`, ephemeral: true });
    }
};
