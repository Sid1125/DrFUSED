const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/Giveaway'); // Import the Giveaway model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawayend')
        .setDescription('End a giveaway early')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The ID of the giveaway message')
                .setRequired(true)),
    category: 'giveaway',

    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');

        try {
            const giveaway = await Giveaway.findOne({ messageId: messageId });
            if (!giveaway) {
                return interaction.reply({
                    content: 'No giveaway found with that message ID.',
                    ephemeral: true
                });
            }

            const channel = await interaction.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            const reactions = message.reactions.cache.get('🎉');
            const participants = reactions ? reactions.users.cache.filter(user => !user.bot).map(user => user.id) : [];
            
            if (participants.length === 0) {
                await channel.send(`No participants for the giveaway of **${giveaway.prize}**.`);
            } else {
                const winnerId = participants[Math.floor(Math.random() * participants.length)];
                const winner = await interaction.guild.members.fetch(winnerId);
                await channel.send(`🎉 Congratulations ${winner}, you won **${giveaway.prize}**! 🎉`);
            }

            // Corrected deletion line
            await Giveaway.deleteOne({ messageId: messageId }); 

            await interaction.reply({
                content: 'The giveaway has ended.',
                ephemeral: true
            });

        } catch (error) {
            console.error('Error ending giveaway:', error);
            await interaction.reply({
                content: 'An error occurred while ending the giveaway. Please try again.',
                ephemeral: true
            });
        }
    },
};
