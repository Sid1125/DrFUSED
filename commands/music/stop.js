const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the currently playing song and clears the queue.'),
	category: 'music',
	async execute(interaction) {
		await interaction.deferReply();
		const guildId = interaction.guild.id;
		const queue = queues.get(guildId);

		if (!queue) {
			return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'There is no song currently playing!' }] });
		}

		queue.songs = []; // Clear the queue
		queue.playing = false;
		queue.connection.destroy(); // Leave the voice channel
		queues.delete(guildId); // Clear queue from global storage

		return interaction.followUp({ embeds: [{ color: 0x00ff00, description: 'Stopped the music and cleared the queue.' }] });
	},
};
