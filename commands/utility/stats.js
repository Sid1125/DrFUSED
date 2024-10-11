const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Shows information about the bot'),
  
	async execute(interaction) {
		let totalUsers = 0;

		// Loop through each guild and add the number of members
		interaction.client.guilds.cache.forEach(guild => {
			totalUsers += guild.memberCount;
		});

		// WebSocket heartbeat ping (fallback if this is -1)
		let wsPing = interaction.client.ws.ping;
		if (wsPing === -1) {
			wsPing = "N/A";  // In case the ping is not available
		}

		// Capture the time before replying to measure the round-trip latency
		const start = Date.now();

		// Send an initial reply
		await interaction.reply({ content: 'Calculating ping...', fetchReply: true });

		// Calculate round-trip ping
		const roundTripPing = Date.now() - start;

		const embed = new EmbedBuilder()
      .setTitle('Bot Stats')
      .addFields(
        { name: 'Server Count', value: interaction.client.guilds.cache.size.toString(), inline: true },
        { name: 'User Count', value: totalUsers.toString(), inline: true },
        { name: 'WebSocket Ping', value: `${wsPing}ms`, inline: true },  // WebSocket ping
        { name: 'Round-Trip Ping', value: `${roundTripPing}ms`, inline: true },  // Round-trip latency
        { name: 'Uptime', value: getUptime(), inline: true }
      )
      .setColor('#1ad0f6');

		// Edit the initial reply with the correct stats
		await interaction.editReply({ content: null, embeds: [embed] });
	},
};

// Helper function to get the bot's uptime
function getUptime() {
  const totalSeconds = process.uptime();
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
