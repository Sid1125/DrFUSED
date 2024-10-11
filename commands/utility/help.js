const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Displays a list of available commands or information about a specific command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command you want help with')),

	async execute(interaction) {
		const { commands } = interaction.client;

		// Get command name from the options
		const commandName = interaction.options.getString('command');

		if (!commandName) {
			const helpEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Command List')
				.setDescription('Here is a list of all available commands:')
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setFooter({ text: `Use /help <command> to get more info on a command.` })
				.addFields([...commands.values()].map(command => {
					return {
						name: `**${command.data.name} ${command.data.usage || ''}**`,
						value: `${command.data.description}`,
						inline: false
					};
				}));

			return interaction.reply({ embeds: [helpEmbed] });
		} else {
			const command = commands.get(commandName.toLowerCase());

			if (!command) {
				return interaction.reply("that's not a valid command!");
			}

			const helpEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Help: ${command.data.name}`)
				.setDescription(`${command.data.description}`)
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.addField('Usage', `${command.data.usage || ''}`);

			if (command.data.aliases) helpEmbed.addField('Aliases', command.data.aliases.join(', '));
			if (command.data.example) helpEmbed.addField('Example', command.data.example);

			return interaction.reply({ embeds: [helpEmbed] });
		}
	},
};
