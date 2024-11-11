const { SlashCommandBuilder } = require('@discordjs/builders');
const Chat = require('../../models/Chat'); // Adjust the path according to your file structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchatbotchannel')
        .setDescription('Sets the channel for the chatbot responses.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the chatbot channel')
                .setRequired(true)),
    category: 'chatbot',
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        // Save to the database
        await Chat.create({
            guildId: guildId,
            channelId: channel.id,
        });

        await interaction.reply(`Chatbot responses will now be sent in ${channel}.`);
    },
};
