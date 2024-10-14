const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('privacy')
        .setDescription('View the Privacy Policy for Dr FUSED'),
    category: 'utility',
    async execute(interaction) {
        const privacyEmbed = new EmbedBuilder()
            .setTitle('Dr FUSED - Privacy Policy')
            .setDescription(
                `We value your privacy and ensure your data is protected. Key points:\n\n` +
                `1. **Data Collected**: We collect User IDs and Server IDs for moderation.\n` +
                `2. **Data Usage**: Data is used solely for moderation features like warnings and kicks.\n` +
                `3. **Retention**: Warnings are reset after 10 days, and kicked users' data is deleted.\n` +
                `4. **Your Rights**: You can request your data be deleted at any time.\n\n` +
                `Read the full [Privacy Policy](https://sid1125.github.io/DrFUSED/privacy.html).`
            )
            .setColor(0x00AE86)
            .setFooter({ text: 'Dr FUSED © 2024' })
            .setTimestamp();

        await interaction.reply({ embeds: [privacyEmbed], ephemeral: true });
    },
};
