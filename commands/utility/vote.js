const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Get a Top.gg vote link to support the bot'),
    category: 'utility',
    
    async execute(interaction) {
        const voteLink = `https://top.gg/bot/1293244608028999690`; // Bot's Top.gg vote link
        const embedColor = 0x5865F2; // Discord blurple color

        try {
            // Create the embed message
            const embed = new EmbedBuilder()
                .setTitle('🌟 Support Us on Top.gg!')
                .setDescription(`[Click here to vote for the bot](${voteLink})\nYour support helps us grow and improve the bot for everyone!`)
                .setColor(embedColor)
                .setThumbnail(interaction.client.user.displayAvatarURL()) // Set bot's avatar as thumbnail
                .setFooter({
                    text: 'Thank you for supporting the bot!',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            // Reply to the interaction
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error executing /vote command:', error);
            
            // Check if the interaction has already been acknowledged
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'There was an error while processing your request. Please try again later!',
                    ephemeral: true
                });
            } else {
                console.warn('Interaction has already been acknowledged, cannot reply:', error);
            }
        }
    },
};
