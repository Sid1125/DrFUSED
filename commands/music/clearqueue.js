const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearqueue')
		.setDescription('Clears the entire song queue.'),
	category: 'music',
	async execute(interaction) {
		await interaction.deferReply();
		const guildId = interaction.guild.id;
		const queue = queues.get(guildId);

		if (!queue || queue.songs.length === 0) {
			return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'The queue is already empty!' }] });
		}

		queue.songs = []; // Clear the queue
		return interaction.followUp({ embeds: [{ color: 0x00ff00, description: 'Cleared the entire song queue.' }] });
	},
};
