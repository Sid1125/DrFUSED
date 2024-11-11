const { SlashCommandBuilder } = require('@discordjs/builders');
const { queues } = require('./play'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggles autoplay mode to continue playing related songs.'),
    category: 'music',
    async execute(interaction) {
        const queue = queues.get(interaction.guild.id); // Get the queue for the current guild

        if (!queue) {
            return interaction.reply({ content: 'No music queue found.', ephemeral: true }); // Reply with ephemeral message if no queue exists
        }

        // Toggle autoplay in the queue object
        queue.autoplay = !queue.autoplay;

        const status = queue.autoplay ? 'enabled' : 'disabled'; // Set the status message
        return interaction.reply({ content: `Autoplay is now **${status}**.`, ephemeral: true }); // Reply with the current autoplay status
    },
};
