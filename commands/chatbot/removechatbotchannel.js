const { SlashCommandBuilder } = require('@discordjs/builders');
const Chat = require('../../models/Chat'); // Adjust the path according to your file structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removechatbotchannel')
        .setDescription('Removes the chatbot channel setting.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to remove from the chatbot settings')
                .setRequired(true)),
    category: 'chatbot',
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        // Remove from the database
        await Chat.deleteOne({
            guildId: guildId,
            channelId: channel.id,
        });

        await interaction.reply(`Removed ${channel} from chatbot responses.`);
    },
};
