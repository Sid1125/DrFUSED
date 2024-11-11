const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Generate an invite link for the bot'),
    category: 'utility',
    async execute(interaction) {
        try {
            // Generate the invite link
            const inviteLink = `https://discord.com/oauth2/authorize?client_id=1293244608028999690`;

            // Create the embed message
            const embed = new EmbedBuilder()
                .setTitle('Invite Me to Your Server!')
                .setDescription(`[Click here to invite the bot](${inviteLink})`)
                .setColor(0x00AE86)
                .setFooter({ text: 'Thank you for supporting the bot!' })
                .setTimestamp();

            // Reply to the interaction
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing /invite command:', error);
            // Check if interaction is already acknowledged before replying
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                // If already replied or deferred, log the issue
                console.warn('Interaction has already been acknowledged, cannot reply:', error);
            }
        }
    },
};
