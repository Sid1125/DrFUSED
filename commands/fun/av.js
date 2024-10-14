const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('av')
		.setDescription('Displays the avatar of the specified user.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user whose avatar to display')
				.setRequired(false)),
	category: 'fun',
	async execute(interaction) {
		await interaction.deferReply();

		const user = interaction.options.getUser('user') || interaction.user;
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s avatar`)
            .setColor(0x333333)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }));

        interaction.followUp({ embeds: [avatarEmbed] });
	},
};