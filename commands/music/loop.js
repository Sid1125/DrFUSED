const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggles looping of the current song.'),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();
        const guildId = interaction.guild.id;
        const queue = queues.get(guildId);

        if (!queue || !queue.playing) {
            return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'There is no song currently playing!' }] });
        }

        queue.looping = !queue.looping; // Toggle looping
        return interaction.followUp({ embeds: [{ color: 0x00ff00, description: `Looping is now ${queue.looping ? 'enabled' : 'disabled'}.` }] });
    },
};
